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
  // DoctorDetails screen used by FindDoctors; include params though screen might not be registered yet
  DoctorDetails?: {
    doctorId?: string;
    doctorName?: string;
    specialty?: string;
    rating?: string;
    distance?: string;
    image?: string;
    experience?: string;
  } | undefined;
};
