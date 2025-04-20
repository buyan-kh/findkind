import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Award, Phone } from 'lucide-react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '@/constants/theme';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';

export interface MatchItem {
  id: string;
  name: string;
  description: string;
  image: string;
  lastSeen: string;
  location: string;
  matchPercentage: number;
  contactPhone?: string;
}

interface MatchCardProps {
  match: MatchItem;
  onContact?: (match: MatchItem) => void;
  expanded?: boolean;
  showPercentage?: boolean;
}

const MatchCard = ({
  match,
  onContact,
  expanded = false,
  showPercentage = false,
}: MatchCardProps) => {
  const formattedDate = match.lastSeen
    ? new Date(match.lastSeen).toLocaleDateString()
    : 'Unknown';

  const matchColorClass =
    match.matchPercentage > 80
      ? styles.highMatch
      : match.matchPercentage > 60
      ? styles.mediumMatch
      : styles.lowMatch;

  const matchTextClass =
    match.matchPercentage > 80
      ? styles.highMatchText
      : match.matchPercentage > 60
      ? styles.mediumMatchText
      : styles.lowMatchText;

  return (
    <Card
      touchable
      style={
        expanded ? ([styles.card, styles.expandedCard] as any) : styles.card
      }
      elevation={expanded ? 'large' : 'medium'}
    >
      {showPercentage && (
        <View style={styles.matchBadge}>
          <View style={[styles.matchBadgeInner, matchColorClass]}>
            <Text style={[styles.matchPercentageText, matchTextClass]}>
              {match.matchPercentage}%
            </Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: match.image }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {match.name}
          </Text>

          <View style={styles.infoRow}>
            <Calendar size={SIZES.medium} color={COLORS.gray} />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={SIZES.medium} color={COLORS.gray} />
            <Text style={styles.infoText} numberOfLines={1}>
              {match.location}
            </Text>
          </View>

          {!expanded && (
            <Text style={styles.descriptionPreview} numberOfLines={2}>
              {match.description}
            </Text>
          )}

          {expanded && (
            <>
              <View style={styles.divider} />

              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.description}>{match.description}</Text>

              <View style={styles.matchQualityContainer}>
                <Award size={SIZES.medium} color={COLORS.primary} />
                <Text style={styles.matchQualityText}>
                  {match.matchPercentage > 80
                    ? 'High'
                    : match.matchPercentage > 60
                    ? 'Medium'
                    : 'Low'}{' '}
                  match confidence
                </Text>
              </View>

              {match.contactPhone && (
                <View style={styles.contactSection}>
                  <View style={styles.contactInfo}>
                    <Phone size={SIZES.medium} color={COLORS.primary} />
                    <Text style={styles.contactText}>{match.contactPhone}</Text>
                  </View>

                  <Button
                    title="Contact"
                    onPress={() => onContact && onContact(match)}
                    variant="primary"
                    size="small"
                  />
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    marginVertical: SIZES.spacing,
    marginHorizontal: SIZES.spacingSmall,
  },
  expandedCard: {
    marginVertical: SIZES.spacingLarge,
  },
  content: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 100,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    padding: SIZES.spacingLarge,
  },
  name: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.black,
    marginBottom: SIZES.spacingSmall,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingSmall,
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginLeft: SIZES.spacingSmall,
    flex: 1,
  },
  matchBadge: {
    position: 'absolute',
    top: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
    zIndex: 1,
    ...SHADOWS.small,
  },
  matchBadgeInner: {
    borderRadius: 20,
    paddingHorizontal: SIZES.spacing,
    paddingVertical: SIZES.spacingSmall,
  },
  highMatch: {
    backgroundColor: COLORS.success,
  },
  mediumMatch: {
    backgroundColor: COLORS.warning,
  },
  lowMatch: {
    backgroundColor: COLORS.error,
  },
  matchPercentageText: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  highMatchText: {
    color: '#FFFFFF',
  },
  mediumMatchText: {
    color: '#FFFFFF',
  },
  lowMatchText: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SIZES.spacing,
  },
  descriptionTitle: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginBottom: SIZES.spacingSmall,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    lineHeight: SIZES.medium * 1.5,
    marginBottom: SIZES.spacingLarge,
  },
  matchQualityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingLarge,
  },
  matchQualityText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginLeft: SIZES.spacingSmall,
  },
  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.spacing,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginLeft: SIZES.spacingSmall,
  },
  descriptionPreview: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginTop: SIZES.spacingSmall,
    lineHeight: SIZES.medium * 1.3,
  },
});

export default MatchCard;
