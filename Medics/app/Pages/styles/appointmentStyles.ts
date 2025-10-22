import { StyleSheet } from "react-native";

const appointmentStyles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  // Doctor Profile
  doctorProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  doctorDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  doctorProfileInfo: {
    flex: 1,
  },
  doctorDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  doctorDetailSpecialty: {
    fontSize: 14,
    color: '#3CB179',
    marginBottom: 8,
    fontWeight: '500',
  },
  doctorDetailStats: {
    flexDirection: 'row',
    gap: 16,
  },
  doctorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorStatText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Appointment Sections
  appointmentSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  changeText: {
    fontSize: 14,
    color: '#3CB179',
    fontWeight: '500',
  },
  appointmentDetail: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },

  // Payment Details
  paymentDetails: {
    marginTop: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentItem: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentAmount: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
  },

  // Payment Method
  paymentMethod: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },

  // Booking Footer
  bookingFooter: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  totalFooter: {
    flex: 1,
  },
  totalFooterLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalFooterAmount: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  bookingButton: {
    backgroundColor: '#3CB179',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 16,
  },
  bookingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Scroll View
  scrollContent: {
    paddingBottom: 120, // Space for fixed footer
  },
  // Add these to your appointmentStyles in app/styles/appointmentStyles.ts

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
},
modalContent: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '80%',
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#1F2937',
},
reasonsList: {
  maxHeight: 400,
},
reasonItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6',
},
selectedReasonItem: {
  backgroundColor: '#F0F9F4',
},
reasonText: {
  fontSize: 16,
  color: '#1F2937',
  flex: 1,
},
selectedReasonText: {
  color: '#3CB179',
  fontWeight: '500',
},
doneButton: {
  backgroundColor: '#3CB179',
  margin: 20,
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
},
doneButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
});

export default appointmentStyles;