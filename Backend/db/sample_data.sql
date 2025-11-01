-- Sample data for Healthy Smiles application
-- Run this after running schema.sql

-- Sample Doctors Data
INSERT INTO doctors_data (id, name, specialty, rating, reviews_count, experience, distance, image, about, hospital, hospital_id, consultation_fee, availability, categories) VALUES
('1', 'Dr. Sarah Johnson', 'General Physician', 4.8, 234, '10 years', '500m', 'https://randomuser.me/api/portraits/women/1.jpg', 'Board-certified general physician with extensive experience in family medicine and preventive care.', 'Apollo Hospitals', 'h1', 500, 
'{"monday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "tuesday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "wednesday": ["09:00", "10:00", "11:00"], "thursday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "friday": ["09:00", "10:00", "11:00", "14:00", "15:00"], "saturday": ["09:00", "10:00", "11:00"], "sunday": []}'::jsonb,
'["General", "Family Medicine"]'::jsonb),

('2', 'Dr. Michael Chen', 'Cardiologist', 4.9, 189, '15 years', '1.2km', 'https://randomuser.me/api/portraits/men/2.jpg', 'Specialized in cardiovascular diseases and interventional cardiology.', 'Apollo Hospitals', 'h1', 800,
'{"monday": ["10:00", "11:00", "15:00", "16:00"], "tuesday": ["10:00", "11:00", "15:00", "16:00"], "wednesday": ["10:00", "11:00"], "thursday": ["10:00", "11:00", "15:00", "16:00"], "friday": ["10:00", "11:00", "15:00", "16:00"], "saturday": [], "sunday": []}'::jsonb,
'["Cardiologist", "Heart Specialist"]'::jsonb),

('3', 'Dr. Emily White', 'Dentist', 4.7, 156, '8 years', '800m', 'https://randomuser.me/api/portraits/women/3.jpg', 'Expert in cosmetic dentistry and oral surgery.', 'City Dental Clinic', 'h2', 600,
'{"monday": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"], "tuesday": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"], "wednesday": ["09:00", "10:00", "11:00"], "thursday": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"], "friday": ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"], "saturday": ["09:00", "10:00"], "sunday": []}'::jsonb,
'["Dentist", "Oral Surgery"]'::jsonb),

('4', 'Dr. James Wilson', 'Psychiatrist', 4.6, 98, '12 years', '2km', 'https://randomuser.me/api/portraits/men/4.jpg', 'Specialized in anxiety disorders, depression, and cognitive behavioral therapy.', 'Mind Wellness Center', 'h3', 700,
'{"monday": ["11:00", "12:00", "16:00", "17:00"], "tuesday": ["11:00", "12:00", "16:00", "17:00"], "wednesday": ["11:00", "12:00"], "thursday": ["11:00", "12:00", "16:00", "17:00"], "friday": ["11:00", "12:00", "16:00", "17:00"], "saturday": [], "sunday": []}'::jsonb,
'["Psychiatrist", "Mental Health"]'::jsonb),

('5', 'Dr. Lisa Anderson', 'Lungs Specialist', 4.8, 145, '11 years', '1.5km', 'https://randomuser.me/api/portraits/women/5.jpg', 'Pulmonologist specializing in asthma, COPD, and respiratory infections.', 'Apollo Hospitals', 'h1', 750,
'{"monday": ["09:00", "10:00", "14:00", "15:00"], "tuesday": ["09:00", "10:00", "14:00", "15:00"], "wednesday": ["09:00", "10:00"], "thursday": ["09:00", "10:00", "14:00", "15:00"], "friday": ["09:00", "10:00", "14:00", "15:00"], "saturday": ["09:00", "10:00"], "sunday": []}'::jsonb,
'["Lungs Specialist", "Pulmonologist"]'::jsonb);

-- Sample Medicines
INSERT INTO medicines (id, name, price, original_price, currency, size, description, rating, reviews_count, image, category, manufacturer, prescription, stock, on_sale) VALUES
('m1', 'Panadol Extra', 150, 180, '₹', '20 tablets', 'Effective relief from headaches, fever, and body pains', 4.5, 189, 'https://via.placeholder.com/150', 'Pain Relief', 'GSK', false, 150, true),
('m2', 'Vitamin C 1000mg', 299, 299, '₹', '60 tablets', 'Immune system support and antioxidant protection', 4.7, 234, 'https://via.placeholder.com/150', 'Vitamins', 'Nature Made', false, 200, false),
('m3', 'Amoxicillin 500mg', 450, 450, '₹', '21 capsules', 'Antibiotic for bacterial infections', 4.3, 89, 'https://via.placeholder.com/150', 'Antibiotics', 'Cipla', true, 80, false),
('m4', 'Cough Syrup', 95, 120, '₹', '100ml', 'Relief from dry and wet cough', 4.2, 156, 'https://via.placeholder.com/150', 'Cold & Flu', 'Benadryl', false, 120, true),
('m5', 'Aspirin 100mg', 85, 100, '₹', '30 tablets', 'Pain relief and heart health support', 4.6, 267, 'https://via.placeholder.com/150', 'Pain Relief', 'Bayer', false, 180, true);

-- Sample Hospitals
INSERT INTO hospitals (id, name, speciality, rating, reviews_count, distance, latitude, longitude, address, phone, email, emergency, departments, facilities, image) VALUES
('h1', 'Apollo Hospitals', 'Multi-Speciality', 4.7, 567, '2.5km', 13.0067, 80.2206, '21 Greams Lane, Chennai', '+91-44-2829-3333', 'info@apollohospitals.com', true,
'["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Oncology"]'::jsonb,
'["24/7 Emergency", "ICU", "Pharmacy", "Blood Bank", "Parking", "Cafeteria"]'::jsonb,
'https://via.placeholder.com/300x200'),

('h2', 'City Dental Clinic', 'Dental Speciality', 4.5, 234, '800m', 13.0100, 80.2250, '45 MG Road, Chennai', '+91-44-2345-6789', 'contact@citydentalclinic.com', false,
'["General Dentistry", "Orthodontics", "Cosmetic Dentistry", "Oral Surgery"]'::jsonb,
'["Parking", "Waiting Room", "Modern Equipment"]'::jsonb,
'https://via.placeholder.com/300x200'),

('h3', 'Mind Wellness Center', 'Psychiatric Care', 4.6, 145, '2km', 13.0150, 80.2300, '78 Beach Road, Chennai', '+91-44-3456-7890', 'info@mindwellness.com', false,
'["Psychiatry", "Psychology", "Counseling", "De-addiction"]'::jsonb,
'["Private Consultation Rooms", "Parking", "Comfortable Waiting Area"]'::jsonb,
'https://via.placeholder.com/300x200');

-- Sample Articles
INSERT INTO articles (category, title, date, read_time, image, content, trending) VALUES
('Health', '5 Ways to Boost Your Heart Health', '2025-10-28', '5 min', 'https://via.placeholder.com/400x250', 
'Regular exercise, a balanced diet, managing stress, getting adequate sleep, and avoiding smoking are crucial for maintaining a healthy heart. Incorporating these habits into your daily routine can significantly reduce the risk of cardiovascular diseases.', true),

('Wellness', 'Mental Health in Modern Times', '2025-10-30', '8 min', 'https://via.placeholder.com/400x250',
'In today''s fast-paced world, mental health has become increasingly important. Understanding stress management, seeking professional help when needed, and maintaining work-life balance are essential for overall well-being.', true),

('Nutrition', 'Understanding Vitamin Deficiencies', '2025-10-25', '6 min', 'https://via.placeholder.com/400x250',
'Vitamin deficiencies can lead to various health problems. Learn about the most common vitamin deficiencies, their symptoms, and how to address them through diet and supplementation.', false),

('Fitness', 'Home Workout Routine for Beginners', '2025-10-29', '7 min', 'https://via.placeholder.com/400x250',
'Starting a fitness journey doesn''t require expensive gym memberships. This guide provides effective home workout routines that can help beginners build strength and improve cardiovascular health.', false);

-- Sample FAQs
INSERT INTO faqs (question, answer, display_order) VALUES
('What time is your customer service available?', 'Our customer service is available 24/7 to assist you with any questions or concerns.', 1),
('How do I book an appointment?', 'You can book an appointment by searching for doctors in your specialty and selecting an available time slot from their calendar.', 2),
('Can I cancel my appointment?', 'Yes, you can cancel appointments up to 2 hours before the scheduled time from the Appointments page.', 3),
('How do I upload medical records?', 'Go to your profile, navigate to Medical Files, and use the upload button to securely upload your medical documents. All files are encrypted for your privacy.', 4),
('What payment methods are accepted?', 'We accept various payment methods including credit/debit cards, UPI, net banking, and digital wallets.', 5),
('How can I contact a doctor?', 'You can use the secure chat feature to communicate with your doctor. Messages are end-to-end encrypted for your privacy.', 6),
('Is my medical data secure?', 'Yes, all medical data is encrypted using advanced El Gamal encryption. Your files can only be accessed by you and authorized medical professionals.', 7),
('How do I order medicines?', 'Browse our pharmacy section, add medicines to your cart, and proceed to checkout. We offer home delivery within 3 days.', 8);

-- Add some sample chat contacts (these would normally be created when a patient starts a conversation)
-- Note: You'll need actual patient IDs from your patients table to use these

COMMIT;
