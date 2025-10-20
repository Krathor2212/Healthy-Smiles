import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useMemo, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import type { RootStackParamList } from '../navigation/types';
import { articlesStyles } from "./styles/articlesStyles";
import { Article, ArticlesData } from "./types/articles";

// Article data for different categories
const articlesData: ArticlesData = {
  "Diseases": [
    {
      id: 1,
      category: "Diseases",
      title: "Understanding Long COVID: Symptoms and Management",
      date: "Mar 15, 2025",
      readTime: "",
      content: `Long COVID refers to symptoms that persist for weeks or months after the initial COVID-19 infection. Common symptoms include fatigue, brain fog, and respiratory issues.

## Key Symptoms:
• Persistent fatigue and exhaustion
• Cognitive impairment or 'brain fog'
• Shortness of breath or breathing difficulties
• Chest pain and heart palpitations
• Joint and muscle pain

## Management Strategies:
• Gradual return to physical activity
• Cognitive behavioral therapy
• Breathing exercises and pulmonary rehabilitation
• Adequate rest and sleep hygiene
• Nutritional support and hydration

Consult your healthcare provider for personalized management plans.`,
      trending: true
    },
    {
      id: 2,
      category: "Diseases",
      title: "New Breakthroughs in Diabetes Treatment",
      date: "Feb 12, 2025",
      readTime: "",
      content: `Recent advancements in diabetes treatment are revolutionizing patient care. New medications and technologies offer better glucose control and quality of life.

## Latest Developments:
• GLP-1 receptor agonists for weight management
• Continuous glucose monitoring systems
• Artificial pancreas technology
• Stem cell research for beta cell regeneration
• Personalized medicine approaches

## Benefits:
• Improved HbA1c control
• Reduced hypoglycemia risk
• Better weight management
• Enhanced quality of life

Always consult with your endocrinologist before making treatment changes.`,
      trending: true
    },
    {
      id: 3,
      category: "Diseases",
      title: "Heart Disease Prevention: Latest Guidelines",
      date: "Jan 10, 2025",
      readTime: "",
      content: `Cardiovascular disease remains a leading cause of death worldwide. Updated prevention guidelines emphasize lifestyle modifications and early detection.

## Prevention Strategies:
• Regular physical activity (150 minutes/week)
• Mediterranean diet rich in fruits and vegetables
• Smoking cessation and alcohol moderation
• Stress management techniques
• Regular health screenings

## Risk Factors to Monitor:
• High blood pressure
• Elevated cholesterol levels
• Diabetes and prediabetes
• Obesity and sedentary lifestyle
• Family history of heart disease

Early intervention can significantly reduce cardiovascular risk.`,
      trending: true
    },
    {
      id: 4,
      category: "Diseases",
      title: "Managing Arthritis Pain: New Approaches",
      date: "Dec 8, 2024",
      readTime: "",
      content: `Arthritis management has evolved with new treatment options focusing on pain relief and joint preservation.

## Treatment Options:
• Biologic medications for inflammatory arthritis
• Physical therapy and exercise programs
• Joint protection techniques
• Dietary modifications and supplements
• Minimally invasive procedures

## Self-Care Tips:
• Maintain healthy weight
• Practice low-impact exercises
• Use heat and cold therapy
• Protect joints during daily activities
• Get adequate rest

Work with your rheumatologist for comprehensive care.`,
      trending: false
    },
    {
      id: 5,
      category: "Diseases",
      title: "Mental Health and Chronic Illness Connection",
      date: "Nov 5, 2024",
      readTime: "",
      content: `The bidirectional relationship between mental health and chronic diseases is increasingly recognized in medical practice.

## Key Connections:
• Depression and cardiovascular disease
• Anxiety and gastrointestinal disorders
• Stress and autoimmune conditions
• Chronic pain and mental health
• Medication effects on mood

## Integrated Care Approach:
• Collaborative treatment planning
• Mental health screening in primary care
• Patient support groups and counseling
• Mindfulness and stress reduction
• Comprehensive wellness programs

Holistic care addresses both physical and mental health needs.`,
      trending: false
    },
    {
      id: 6,
      category: "Diseases",
      title: "Advances in Cancer Immunotherapy",
      date: "Oct 3, 2024",
      readTime: "",
      content: `Immunotherapy has revolutionized cancer treatment by harnessing the body's immune system to fight cancer cells.

## Treatment Approaches:
• Checkpoint inhibitors for various cancers
• CAR-T cell therapy for blood cancers
• Cancer vaccines for prevention and treatment
• Combination therapies with traditional treatments
• Personalized immunotherapy approaches

## Benefits:
• Targeted cancer cell destruction
• Reduced side effects compared to chemotherapy
• Long-lasting remission in some cases
• Improved quality of life during treatment
• Hope for previously untreatable cancers

Consult oncology specialists for latest treatment options.`,
      trending: false
    }
  ],
  "Diet": [
    {
      id: 1,
      category: "Diet",
      title: "Mediterranean Diet: Complete Guide for Beginners",
      date: "Mar 14, 2025",
      readTime: "",
      content: `The Mediterranean diet is consistently ranked as one of the healthiest eating patterns worldwide, emphasizing whole foods and healthy fats.

## Core Principles:
• Abundance of fruits and vegetables
• Whole grains and legumes
• Healthy fats from olive oil and nuts
• Moderate fish and poultry consumption
• Limited red meat and sweets

## Health Benefits:
• Reduced cardiovascular risk
• Improved brain health
• Better weight management
• Lower inflammation markers
• Enhanced longevity

## Sample Daily Plan:
• Breakfast: Greek yogurt with berries and nuts
• Lunch: Quinoa salad with vegetables and olive oil
• Dinner: Grilled fish with roasted vegetables
• Snacks: Fresh fruit and handful of almonds

Start gradually and focus on sustainable changes.`,
      trending: true
    },
    {
      id: 2,
      category: "Diet",
      title: "Intermittent Fasting: Science and Safety",
      date: "Feb 11, 2025",
      readTime: "",
      content: `Intermittent fasting has gained popularity for weight management and metabolic health, but understanding its proper implementation is crucial.

## Popular Methods:
• 16:8 method (16-hour fast, 8-hour eating window)
• 5:2 diet (5 normal days, 2 restricted days)
• Alternate day fasting
• Time-restricted eating

## Potential Benefits:
• Weight loss and fat reduction
• Improved insulin sensitivity
• Cellular repair processes
• Reduced inflammation
• Simpler eating schedule

## Safety Considerations:
• Not suitable for everyone
• Monitor hydration and nutrient intake
• Consult healthcare provider if pregnant or diabetic
• Listen to your body's signals
• Combine with nutritious food choices

Individual results may vary - consult a nutritionist.`,
      trending: true
    },
    {
      id: 3,
      category: "Diet",
      title: "Keto Diet: Benefits and Risks Explained",
      date: "Jan 9, 2025",
      readTime: "",
      content: `The ketogenic diet has shown promise for weight loss and certain health conditions, but understanding both benefits and risks is essential.

## Key Principles:
• High fat, very low carbohydrate intake
• Moderate protein consumption
• Induction of ketosis for energy
• Focus on whole food sources
• Careful monitoring of nutrients

## Potential Benefits:
• Rapid initial weight loss
• Improved blood sugar control
• Reduced appetite and cravings
• Potential neurological benefits
• Enhanced mental clarity for some

## Important Considerations:
• Keto flu during adaptation
• Nutrient deficiency risks
• Long-term sustainability challenges
• Not suitable for certain medical conditions
• Requires medical supervision for some

Always consult healthcare providers before starting.`,
      trending: true
    },
    {
      id: 4,
      category: "Diet",
      title: "Plant-Based Nutrition: Getting All Essential Nutrients",
      date: "Dec 7, 2024",
      readTime: "",
      content: `A well-planned plant-based diet can provide all necessary nutrients for optimal health at every life stage.

## Key Nutrients to Focus On:
• Protein: Legumes, tofu, tempeh, seitan
• Iron: Lentils, spinach, fortified cereals
• Calcium: Fortified plant milks, leafy greens
• Vitamin B12: Fortified foods or supplements
• Omega-3: Flaxseeds, walnuts, chia seeds

## Meal Planning Tips:
• Include variety of colorful vegetables
• Combine different protein sources
• Don't forget healthy fats
• Consider supplementation when needed
• Stay hydrated with water

With proper planning, plant-based diets support long-term health.`,
      trending: false
    },
    {
      id: 5,
      category: "Diet",
      title: "Gut Health: Prebiotics and Probiotics Guide",
      date: "Nov 5, 2024",
      readTime: "",
      content: `Understanding the difference between prebiotics and probiotics is key to supporting digestive health and overall wellness.

## Prebiotic Foods:
• Garlic, onions, and leeks
• Asparagus and artichokes
• Bananas and apples
• Whole grains and oats
• Legumes and beans

## Probiotic Foods:
• Yogurt and kefir
• Sauerkraut and kimchi
• Miso and tempeh
• Kombucha and fermented drinks
• Pickled vegetables

## Benefits of Gut Health:
• Improved digestion and regularity
• Enhanced immune function
• Better nutrient absorption
• Mood regulation support
• Reduced inflammation

Incorporate both for optimal gut microbiome health.`,
      trending: false
    },
    {
      id: 6,
      category: "Diet",
      title: "Hydration: More Than Just Drinking Water",
      date: "Oct 4, 2024",
      readTime: "",
      content: `Proper hydration involves more than just drinking water - it's about maintaining electrolyte balance and understanding your body's needs.

## Hydration Sources:
• Water and herbal teas
• Water-rich fruits and vegetables
• Broths and soups
• Coconut water and electrolyte drinks
• Milk and plant-based alternatives

## Signs of Dehydration:
• Dark yellow urine
• Dry mouth and skin
• Fatigue and dizziness
• Headaches and confusion
• Reduced urine output

## Daily Recommendations:
• 8-10 glasses of fluid daily
• More during exercise or heat
• Monitor urine color as guide
• Include electrolyte sources
• Listen to thirst cues

Stay hydrated for optimal physical and mental performance.`,
      trending: false
    }
  ],
  "Fitness": [
    {
      id: 1,
      category: "Fitness",
      title: "High-Intensity Interval Training: Maximize Results",
      date: "Mar 13, 2025",
      readTime: "",
      content: `HIIT workouts offer time-efficient exercise options that can be adapted to various fitness levels and preferences.

## Basic HIIT Structure:
• Warm-up: 5-10 minutes
• Work intervals: 20-60 seconds high intensity
• Recovery intervals: 10-60 seconds low intensity
• Repeat for 15-30 minutes
• Cool-down: 5-10 minutes

## Sample Workouts:
• Bodyweight circuit: Burpees, squats, push-ups
• Cardio intervals: Sprinting, jumping jacks
• Strength focus: Dumbbell complexes
• Mixed modality: Combining different exercises

## Benefits:
• Improved cardiovascular fitness
• Increased calorie burn
• Time efficiency
• Metabolic rate elevation
• Adaptable to any fitness level

Start slowly and progress gradually to prevent injury.`,
      trending: true
    },
    {
      id: 2,
      category: "Fitness",
      title: "Strength Training for Women: Myths and Facts",
      date: "Feb 10, 2025",
      readTime: "",
      content: `Dispelling common myths about women and strength training to encourage safe and effective weight training practices.

## Common Myths Debunked:
• "Lifting makes women bulky" - False
• "Cardio is better for weight loss" - Not necessarily
• "Light weights with high reps are best" - Depends on goals
• "Strength training is unsafe during periods" - Generally safe

## Benefits for Women:
• Increased bone density
• Improved metabolic rate
• Enhanced functional strength
• Better body composition
• Reduced injury risk

## Recommended Approach:
• Compound exercises first
• Progressive overload principle
• Proper form and technique
• Adequate recovery between sessions
• Balanced programming

Strength training benefits women of all ages and fitness levels.`,
      trending: true
    },
    {
      id: 3,
      category: "Fitness",
      title: "Cardio vs Strength: Finding the Right Balance",
      date: "Jan 8, 2025",
      readTime: "",
      content: `Understanding how to balance cardiovascular exercise with strength training for optimal health and fitness results.

## Cardiovascular Exercise:
• Improves heart health and endurance
• Burns calories during activity
• Enhances lung capacity and circulation
• Reduces stress and improves mood
• Supports weight management

## Strength Training:
• Builds and maintains muscle mass
• Increases metabolic rate
• Improves bone density
• Enhances functional strength
• Prevents age-related muscle loss

## Balanced Approach:
• 2-3 days strength training weekly
• 3-5 days cardiovascular exercise
• Listen to your body's recovery needs
• Vary intensity and focus periodically
• Include flexibility and mobility work

Find the balance that works for your goals and lifestyle.`,
      trending: true
    },
    {
      id: 4,
      category: "Fitness",
      title: "Yoga for Stress Relief and Flexibility",
      date: "Dec 6, 2024",
      readTime: "",
      content: `Yoga combines physical postures, breathing techniques, and meditation to promote holistic health and well-being.

## Beginner-Friendly Poses:
• Child's pose for relaxation
• Downward-facing dog for full-body stretch
• Warrior poses for strength and balance
• Cat-cow for spinal flexibility
• Corpse pose for deep relaxation

## Breathing Techniques:
• Deep abdominal breathing
• Alternate nostril breathing
• Ujjayi (ocean breath)
• Box breathing pattern
• Mindful breathing meditation

## Benefits:
• Stress reduction and relaxation
• Improved flexibility and balance
• Enhanced body awareness
• Better sleep quality
• Mental clarity and focus

Practice regularly for cumulative benefits.`,
      trending: false
    },
    {
      id: 5,
      category: "Fitness",
      title: "Recovery Strategies for Active Individuals",
      date: "Nov 4, 2024",
      readTime: "",
      content: `Proper recovery is essential for performance improvement and injury prevention in any fitness routine.

## Active Recovery Methods:
• Light cardio and walking
• Swimming and water exercises
• Yoga and stretching routines
• Foam rolling and self-massage
• Dynamic mobility work

## Passive Recovery Techniques:
• Adequate sleep (7-9 hours)
• Nutrition and hydration
• Compression garments
• Contrast water therapy
• Massage and bodywork

## Recovery Timeline:
• Immediate post-workout (0-4 hours)
• Short-term recovery (24-48 hours)
• Long-term recovery (weekly/monthly)
• Deload weeks for strength training
• Seasonal breaks for athletes

Listen to your body and prioritize recovery as part of your training.`,
      trending: false
    },
    {
      id: 6,
      category: "Fitness",
      title: "Home Workouts: No Equipment Needed",
      date: "Oct 3, 2024",
      readTime: "",
      content: `Effective workouts can be done anywhere with just bodyweight exercises and minimal space requirements.

## Upper Body Exercises:
• Push-ups and variations
• Tricep dips using chair
• Plank and side plank
• Arm circles and shoulder taps
• Superman and bird-dog

## Lower Body Exercises:
• Squats and lunges
• Glute bridges and hip thrusts
• Calf raises and single-leg deadlifts
• Wall sits and isometric holds
• Jumping jacks and high knees

## Core Exercises:
• Crunches and sit-ups
• Leg raises and scissors
• Russian twists and bicycle crunches
• Mountain climbers and plank jacks
• Dead bugs and hollow holds

## Sample Routine:
• Warm-up: 5 minutes dynamic stretching
• Circuit: 3 rounds of 8-12 exercises
• Rest: 30-60 seconds between rounds
• Cool-down: 5 minutes static stretching

Consistency matters more than equipment availability.`,
      trending: false
    }
  ]
};

type ArticleCategory = keyof ArticlesData;

export default function ArticlesScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeTag, setActiveTag] = useState<ArticleCategory>("Diseases");
  const [searchText, setSearchText] = useState("");
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [showAllRelated, setShowAllRelated] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const popularTags: ArticleCategory[] = ["Diseases", "Diet", "Fitness"];

  // Filter articles based on search text and active tag
  const filteredArticles = useMemo(() => {
    const currentArticles = articlesData[activeTag];
    if (!searchText.trim()) {
      return currentArticles;
    }
    
    const searchLower = searchText.toLowerCase();
    return currentArticles.filter((article: Article) => 
      article.title.toLowerCase().includes(searchLower) ||
      article.content.toLowerCase().includes(searchLower) ||
      article.category.toLowerCase().includes(searchLower)
    );
  }, [activeTag, searchText]);

  // Get trending articles (first 2 with trending: true when not showing all)
  const trendingArticles = useMemo(() => {
    const trending = filteredArticles.filter((article: Article) => article.trending);
    return showAllTrending ? trending : trending.slice(0, 2);
  }, [filteredArticles, showAllTrending]);

  // Get related articles (first 2 with trending: false when not showing all)
  const relatedArticles = useMemo(() => {
    const related = filteredArticles.filter((article: Article) => !article.trending);
    return showAllRelated ? related : related.slice(0, 2);
  }, [filteredArticles, showAllRelated]);

  // Check if there are more articles to show in each section
  const hasMoreTrending = filteredArticles.filter((article: Article) => article.trending).length > 2;
  const hasMoreRelated = filteredArticles.filter((article: Article) => !article.trending).length > 2;

  const handleArticlePress = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBackToArticles = () => {
    setSelectedArticle(null);
  };

  const handleBackPress = () => {
    if (selectedArticle) {
      handleBackToArticles();
    } else {
  navigation.goBack();
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    // Reset show all states when searching
    if (text.trim()) {
      setShowAllTrending(true);
      setShowAllRelated(true);
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setShowAllTrending(false);
    setShowAllRelated(false);
  };

  // Article Detail View
  if (selectedArticle) {
    return (
      <View style={articlesStyles.detailContainer}>
        {/* Header with Back Button */}
        <View style={articlesStyles.header}>
          <TouchableOpacity onPress={handleBackToArticles} style={articlesStyles.backButton}>
            <Text style={articlesStyles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={articlesStyles.title}>Article</Text>
          <View style={articlesStyles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={articlesStyles.articleCategory}>
            <Text style={articlesStyles.categoryText}>{selectedArticle.category}</Text>
          </View>
          
          <Text style={articlesStyles.detailTitle}>{selectedArticle.title}</Text>
          
          <View style={articlesStyles.detailMeta}>
            <Text style={articlesStyles.articleDate}>{selectedArticle.date}</Text>
          </View>

          <Text style={articlesStyles.detailContent}>
            {selectedArticle.content.split('\n\n').map((section: string, index: number) => {
              if (section.startsWith('## ')) {
                return (
                  <Text key={String(index)} style={articlesStyles.detailSubtitle}>
                    {section.replace('## ', '')}
                  </Text>
                );
              } else if (section.startsWith('• ')) {
                return section.split('\n').map((point: string, pointIndex: number) => (
                  <Text key={`${index}-${pointIndex}`} style={articlesStyles.bulletPoint}>
                    {point}
                  </Text>
                ));
              } else {
                return (
                  <Text key={String(index)} style={articlesStyles.detailContent}>
                    {section}
                  </Text>
                );
              }
            })}
          </Text>
        </ScrollView>
      </View>
    );
  }

  // Main Articles List View
  return (
    <View style={articlesStyles.container}>
      {/* Header with Back Button */}
      <View style={articlesStyles.header}>
        <TouchableOpacity onPress={handleBackPress} style={articlesStyles.backButton}>
          <Text style={articlesStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={articlesStyles.title}>Articles</Text>
        <View style={articlesStyles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={articlesStyles.searchContainer}>
        <TextInput
          placeholder="Search articles, news..."
          style={articlesStyles.searchInput}
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        {searchText ? (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={{ color: '#9CA3AF', fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Popular Articles Tags */}
        <Text style={articlesStyles.sectionTitle}>Popular Articles</Text>
        <View style={articlesStyles.popularTagsContainer}>
          {popularTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                articlesStyles.tag,
                activeTag === tag && articlesStyles.activeTag
              ]}
              onPress={() => {
                setActiveTag(tag);
                setSearchText(""); // Clear search when changing category
              }}
            >
              <Text style={[
                articlesStyles.tagText,
                activeTag === tag && articlesStyles.activeTagText
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Show search results message */}
        {searchText ? (
          <Text style={{ color: '#6B7280', marginBottom: 15, fontStyle: 'italic' }}>
            {filteredArticles.length} articles found for "{searchText}"
          </Text>
        ) : null}

        {/* Trending Articles - Only show if there are trending articles */}
        {trendingArticles.length > 0 && (
          <>
            <View style={articlesStyles.sectionHeader}>
              <Text style={articlesStyles.sectionTitle}>Trending Articles</Text>
              {!searchText && hasMoreTrending && (
                <TouchableOpacity onPress={() => setShowAllTrending(!showAllTrending)}>
                  <Text style={articlesStyles.seeAll}>
                    {showAllTrending ? "Show less" : "See all"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {trendingArticles.map((article) => (
              <TouchableOpacity 
                key={article.id} 
                style={articlesStyles.articleCard}
                onPress={() => handleArticlePress(article)}
              >
                <View style={articlesStyles.articleCategory}>
                  <Text style={articlesStyles.categoryText}>{article.category}</Text>
                </View>
                <Text style={articlesStyles.articleTitle}>{article.title}</Text>
                <View style={articlesStyles.articleMeta}>
                  <Text style={articlesStyles.articleDate}>{article.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Related Articles - Only show if there are related articles */}
        {relatedArticles.length > 0 && (
          <>
            <View style={articlesStyles.sectionHeader}>
              <Text style={articlesStyles.sectionTitle}>Related Articles</Text>
              {!searchText && hasMoreRelated && (
                <TouchableOpacity onPress={() => setShowAllRelated(!showAllRelated)}>
                  <Text style={articlesStyles.seeAll}>
                    {showAllRelated ? "Show less" : "See all"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {relatedArticles.map((article) => (
              <TouchableOpacity 
                key={article.id} 
                style={articlesStyles.articleCard}
                onPress={() => handleArticlePress(article)}
              >
                <View style={articlesStyles.articleCategory}>
                  <Text style={articlesStyles.categoryText}>{article.category}</Text>
                </View>
                <Text style={articlesStyles.articleTitle}>{article.title}</Text>
                <View style={articlesStyles.articleMeta}>
                  <Text style={articlesStyles.articleDate}>{article.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* No results message */}
        {filteredArticles.length === 0 && searchText && (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#6B7280', fontSize: 16 }}>
              No articles found for "{searchText}"
            </Text>
            <TouchableOpacity onPress={clearSearch} style={{ marginTop: 10 }}>
              <Text style={{ color: '#3CB179', fontWeight: '500' }}>
                Clear search
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}