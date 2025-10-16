import { StyleSheet } from "react-native";

export const topDoctorStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 20 
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
  card: {
    flexDirection: "row", 
    marginBottom: 15, 
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef"
  },
  selectedCard: {
    backgroundColor: "#e3f2fd",
    borderColor: "#0AB6AB"
  },
  image: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    marginRight: 15 
  },
  infoContainer: {
    flex: 1
  },
  name: { 
    fontWeight: "bold", 
    fontSize: 16,
    color: "#000",
    marginBottom: 2
  },
  specialty: { 
    color: "#6c757d", 
    fontSize: 14,
    marginBottom: 8
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15
  },
  ratingIcon: {
    marginRight: 4,
    fontSize: 14
  },
  rating: {
    color: "#0AB6AB",
    fontSize: 13,
    fontWeight: "500"
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  distanceIcon: {
    marginRight: 4,
    fontSize: 14
  },
  distance: {
    color: "#0AB6AB",
    fontSize: 13,
    fontWeight: "500"
  }
});

// Placeholder default export to prevent Expo Router treating this as a missing route.
export default function TopDoctorStylesRoutePlaceholder() { return null; }