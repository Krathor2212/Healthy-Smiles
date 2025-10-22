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
 
  
  DoctorDetails: {
    doctorId: string;
    doctorName: string;
    specialty: string;
    rating: string;
    distance: string;
    image: string;
    experience: string;
  } | undefined;
};
