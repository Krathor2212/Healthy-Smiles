export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  articles: undefined;
  CartScreen: undefined;
  PharmacyScreen: undefined;
  DrugDetailScreen: { product?: string } | undefined;
  topdoctor: undefined;
  FindDoctorsScreen: undefined;
  Profile: undefined;
  EditProfile: undefined;
  MedicalFiles: undefined;
 

  DoctorDetails: {
    doctorId: string;
    doctorName: string;
    specialty: string;
    rating: string;
    distance: string;
    image: string;
    experience: string;
  } | undefined;
  HospitalDetails: {
    hospitalId: string;
    hospitalName: string;
    speciality: string;
    rating: string;
    distance: string;
    latitude: number;
    longitude: number;
  } | undefined;
  Appointment: {
    doctorName?: string;
    specialty?: string;
    rating?: string;
    distance?: string;
    image?: string;
    date?: string;
    time?: string;
    reason?: string;
  } | undefined;
};

// Default export to avoid expo-router treating this file as a route component
export default {} as any;
