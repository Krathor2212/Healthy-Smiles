import { StyleSheet } from "react-native";

export const articlesStyles = StyleSheet.create({
  // AppHeader already handles the top safe area; avoid additional top padding
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#000",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    color: "#111827",
    fontSize: 16,
  },
  popularTagsContainer: {
    flexDirection: "row",
    marginBottom: 25,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 8,
  },
  activeTag: {
    backgroundColor: "#3CB179",
  },
  tagText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTagText: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  seeAll: {
    color: "#3CB179",
    fontWeight: "500",
    fontSize: 14,
  },
  articleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  articleCategory: {
    backgroundColor: "#E6F4FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#3CB179",
    fontWeight: "600",
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    lineHeight: 22,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  articleDate: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 10,
  },
  articleReadTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Article Detail Styles
  detailContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 15,
    lineHeight: 32,
  },
  detailMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 8,
    marginLeft: 10,
  },
});

// Placeholder default export to satisfy Expo Router's route-validator.
export default function ArticlesStylesRoutePlaceholder() { return null; }