import requests
from io import BytesIO
import os
import pickle
import time
import torch
from PIL import Image
from sentence_transformers import SentenceTransformer, util
import json

os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"

USE_SMALLER_MODEL = True  
CACHE_EMBEDDINGS = True   
CACHE_DIR = "cache"       

MODEL_CACHE_DIR = os.path.join(CACHE_DIR, "hf_models")
os.makedirs(MODEL_CACHE_DIR, exist_ok=True)

if CACHE_EMBEDDINGS and not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

def load_local_model(model_name):
    print(f"Loading model {model_name} from local cache only...")
    try:
        return SentenceTransformer(model_name, cache_folder=MODEL_CACHE_DIR)
    except Exception as e:
        print(f"Error loading model {model_name}: {e}")
        print("Using simplified fallback model instead.")
        return SimplifiedEmbeddingModel()

class SimplifiedEmbeddingModel:
    def __init__(self):
        print("Using simplified embedding model (fallback)")
        self.device = torch.device('cpu')
        
    def encode(self, texts, convert_to_tensor=True):
        if isinstance(texts, list):
            batch_size = len(texts)
            emb = torch.rand(batch_size, 64)
        else:
            emb = torch.rand(64)
        return emb
    
    def to(self, device):
        self.device = device
        return self
        
    def eval(self):
        return self
        
    def half(self):
        return self

text_model = None
image_model = None

lost_items = [
    {
        "id": "lucy001",
        "type": 0,
        "description": "dog, brown, golden retriever, no nametag, brown eyes, pink nose, name lucy",
        "image_url": "https://wimg.mk.co.kr/news/cms/202403/08/news-p.v1.20240308.51e5a57b0c18412d9e4f05ed753b9de1_P2.jpg",
        "contact": "lucys_owner@example.com",
        "location": {"lat": 37.7749, "lon": -122.4194}
    },
    {
        "id": "max002",
        "type": 0,
        "description": "dog, black, labrador, blue collar, black nose, white paws, name max",
        "image_url": "https://www.shutterstock.com/image-photo/large-black-dog-white-spot-260nw-1972658609.jpg",
        "contact": "maxs_owner@example.com",
        "location": {"lat": 37.7833, "lon": -122.4167}
    },
    {
        "id": "bella003",
        "type": 0,
        "description": "cat, white, no collar, green eyes, small scar near ear, name bella",
        "image_url": "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1tuDnw.img?w=800&h=415&q=60&m=2&f=jpg",
        "contact": "bella_owner@example.com",
        "location": {"lat": 37.7749, "lon": -122.4194}
    }
]

def load_image_from_url(url, resize=True):
    """Load image from URL with optional resizing for faster processing"""
    try:
        cache_path = f"{CACHE_DIR}/{hash(url)}.pkl" if CACHE_EMBEDDINGS else None
        
        if CACHE_EMBEDDINGS and os.path.exists(cache_path):
            with open(cache_path, 'rb') as f:
                return pickle.load(f)
        
        if url.startswith("file://"):
            local_path = url[7:]
            img = Image.open(local_path)
        else:
            response = requests.get(url)
            img = Image.open(BytesIO(response.content))
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        if resize:
            img = img.resize((128, 128))
            
        if CACHE_EMBEDDINGS:
            with open(cache_path, 'wb') as f:
                pickle.dump(img, f)
                
        return img
    except Exception as e:
        print(f"Error loading image from {url}: {e}")
        return None

def get_cached_embedding(key, generator_func):
    """Get embedding from cache or compute it"""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    if CACHE_EMBEDDINGS:
        cache_path = f"{CACHE_DIR}/{hash(str(key))}.pt"
        if os.path.exists(cache_path):
            return torch.load(cache_path, map_location=device)
        
        embedding = generator_func()
        torch.save(embedding, cache_path)
        return embedding
    else:
        return generator_func()

def haversine_distance(lat1, lon1, lat2, lon2):
    from math import radians, sin, cos, sqrt, atan2
    
    lat1, lon1 = radians(float(lat1)), radians(float(lon1))
    lat2, lon2 = radians(float(lat2)), radians(float(lon2))
    
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    radius = 6371
    
    return radius * c

def search_pets(description, image_url, custom_pets=None, models=None, location=None):
    """Main search function - optimized for speed"""
    global text_model, image_model
    
    if models and "text_model" in models and "image_model" in models:
        local_text_model = models["text_model"]
        local_image_model = models["image_model"]
    else:
        if text_model is None or image_model is None:
            try:
                text_model = load_local_model('all-MiniLM-L6-v2')
                image_model = load_local_model('clip-ViT-B-16' if USE_SMALLER_MODEL else 'clip-ViT-B-32')
            except Exception as e:
                print(f"Error loading models: {e}")
                print("using simplified model")
                text_model = SimplifiedEmbeddingModel()
                image_model = SimplifiedEmbeddingModel()
                
            text_model.eval()
            image_model.eval()
            
            device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            text_model.to(device)
            image_model.to(device)
            
            if device.type == 'cuda':
                text_model = text_model.half()
                image_model = image_model.half()
                
        local_text_model = text_model
        local_image_model = image_model
    
    # Use custom pets list if provided
    pets_data = custom_pets if custom_pets is not None else lost_items
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    start_time = time.time()
    
    animal_type = None
    if "dog" in description.lower():
        animal_type = "dog"
    elif "cat" in description.lower():
        animal_type = "cat"
    elif "person" in description.lower() or "missing" in description.lower():
        animal_type = "person"
    else:
        animal_type = "unknown"
    
    filtered_pets = pets_data
    
    def generate_text_embedding():
        return local_text_model.encode(description, convert_to_tensor=True)
    
    found_text_embedding = get_cached_embedding(f"text_{description}", generate_text_embedding)
    
    def generate_db_text_embeddings():
        return local_text_model.encode([entry["description"] for entry in filtered_pets], convert_to_tensor=True)
    
    db_key = "_".join([str(pet.get("id", hash(json.dumps(pet, default=str)))) for pet in filtered_pets])
    text_embeddings = get_cached_embedding(f"db_text_{db_key}", generate_db_text_embeddings)
    
    text_scores = util.cos_sim(found_text_embedding, text_embeddings)[0]
    
    image_scores = None
    valid_indices = []
    
    if image_url:
        found_image = load_image_from_url(image_url)
        if found_image:
            def generate_image_embedding():
                return local_image_model.encode(found_image, convert_to_tensor=True)
            
            found_image_embedding = get_cached_embedding(f"img_{image_url}", generate_image_embedding)
            
            image_embeddings = []
            
            for i, pet in enumerate(filtered_pets):
                pet_image = load_image_from_url(pet.get("image_url", ""))
                if pet_image:
                    def generate_pet_embedding(pet_img=pet_image, pet_id=pet.get("id", "")):
                        return local_image_model.encode(pet_img, convert_to_tensor=True)
                    
                    embedding = get_cached_embedding(f"img_{pet.get('id', hash(str(pet.get('image_url', ''))))}", generate_pet_embedding)
                    image_embeddings.append(embedding)
                    valid_indices.append(i)
            
            if image_embeddings:
                image_embeddings_tensor = torch.stack(image_embeddings)
                image_scores = util.cos_sim(found_image_embedding, image_embeddings_tensor)[0]
    

    result = []
    for i, text_score in enumerate(text_scores):
        text_similarity = float(text_score) * 100
        
        if text_similarity > 35:  # Minimum text similarity threshold
            image_similarity = None
            if image_scores is not None and i in valid_indices:
                idx = valid_indices.index(i)
                if idx < len(image_scores):
                    image_similarity = float(image_scores[idx]) * 100
            
            location_score = None
            if location and "lat" in location and "lon" in location:
                if "location" in filtered_pets[i] and "lat" in filtered_pets[i]["location"] and "lon" in filtered_pets[i]["location"]:
                    distance = haversine_distance(
                        location["lat"], location["lon"],
                        filtered_pets[i]["location"]["lat"], filtered_pets[i]["location"]["lon"]
                    )
                    location_score = max(0, 100 - (distance * 2))
            
            result_item = {
                "id": filtered_pets[i].get("id", ""),
                "type": filtered_pets[i].get("type", 0),  # 0 for pet, 1 for person
                "description": filtered_pets[i].get("description", ""),
                "text_score": text_similarity,
                "image_score": image_similarity,
                "location_score": location_score,
                "image_url": filtered_pets[i].get("image_url", ""),
                "contact": filtered_pets[i].get("contact", "")
            }
            
            if "location" in filtered_pets[i]:
                result_item["location"] = filtered_pets[i]["location"]
            
            factors = 1 
            combined_score = text_similarity
            
            if image_similarity is not None:
                combined_score += image_similarity
                factors += 1
                
            if location_score is not None:
                combined_score += location_score
                factors += 1
                
            result_item["combined_score"] = combined_score / factors
            result.append(result_item)
    
    results = sorted(result, key=lambda x: x.get("combined_score", x["text_score"]), reverse=True)
    
    end_time = time.time()
    processing_time = (end_time - start_time) * 1000  # Convert to milliseconds
    
    return results, processing_time

if __name__ == "__main__":
    found_description = "dog, black, don't know the breed, black nose"
    found_image_url = "https://cdn.shopify.com/s/files/1/0141/7137/3626/files/cache_2481552836.jpg?v=1737114251"
    found_location = {"lat": 37.7749, "lon": -122.4194}
    
    if text_model is None or image_model is None:
        try:
            text_model = load_local_model('all-MiniLM-L6-v2')
            image_model = load_local_model('clip-ViT-B-16' if USE_SMALLER_MODEL else 'clip-ViT-B-32')
            
            text_model.eval()
            image_model.eval()
            
            device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            text_model.to(device)
            image_model.to(device)
            
            if device.type == 'cuda':
                text_model = text_model.half()
                image_model = image_model.half()
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Falling back to simplified models")
            text_model = SimplifiedEmbeddingModel()
            image_model = SimplifiedEmbeddingModel()
    
    results, processing_time = search_pets(
        description=found_description, 
        image_url=found_image_url,
        location=found_location
    )
    
    if not results:
        print("No matches found with sufficient confidence.")
    else:
        print(f"Found {len(results)} possible matches in {processing_time:.1f}ms:")
        for match in results[:3]:
            print(f"ID: {match['id']}")
            print(f"Type: {'Person' if match.get('type') == 1 else 'Pet'}")
            print(f"Description: {match['description']}")
            print(f"Text Match: {match['text_score']:.1f}%")
            
            if match.get('image_score') is not None:
                print(f"Image Match: {match['image_score']:.1f}%")
            else:
                print("Image Match: N/A")
                
            if match.get('location_score') is not None:
                print(f"Location Match: {match['location_score']:.1f}%")
            else:
                print("Location Match: N/A")
                
            if match.get('combined_score') is not None:
                print(f"Combined Score: {match['combined_score']:.1f}%")
                
            print(f"Image: {match['image_url']}")
            print(f"Contact: {match['contact']}")
            if "location" in match:
                print(f"Location: Lat {match['location'].get('lat')}, Lon {match['location'].get('lon')}")
            print()