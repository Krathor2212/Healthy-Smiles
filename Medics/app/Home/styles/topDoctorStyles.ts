import { StyleSheet } from "react-native";

export const topDoctorStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
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
    marginBottom: 14, 
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginHorizontal: 6,
  },
  selectedCard: {
    backgroundColor: "#e3f2fd",
    borderColor: "#0AB6AB"
  },
  image: { 
    width: 58, 
    height: 58, 
    borderRadius: 29, 
    marginRight: 16,
    resizeMode: 'cover'
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center'
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

export default function TopDoctorStylesRoutePlaceholder() { return null; }