import React, { useState } from 'react';
import { Calendar, User, Clock, Tag, Search, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  titleBn: string;
  excerpt: string;
  excerptBn: string;
  content: string;
  contentBn: string;
  author: string;
  authorBn: string;
  publishDate: string;
  readTime: number;
  category: string;
  categoryBn: string;
  tags: string[];
  tagsBn: string[];
  image: string;
  featured: boolean;
  language: 'en' | 'bn';
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Ultimate Guide to Mango Varieties in Bangladesh',
    titleBn: 'বাংলাদেশের আমের জাতের সম্পূর্ণ গাইড',
    excerpt: 'Discover the rich diversity of mango varieties grown in Bangladesh, from the royal Himsagar to the sweet Amrapali.',
    excerptBn: 'বাংলাদেশে উৎপাদিত আমের বিভিন্ন জাতের সমৃদ্ধ বৈচিত্র্য আবিষ্কার করুন, রাজকীয় হিমসাগর থেকে মিষ্টি আম্রপালি পর্যন্ত।',
    content: `Bangladesh is home to over 100 varieties of mangoes, making it one of the world's most diverse mango-producing countries. Each variety has its unique characteristics, flavor profile, and growing season.

**Himsagar - The King of Mangoes**
Himsagar, literally meaning "ocean of snow," is considered the finest mango variety in Bangladesh. Grown primarily in Rajshahi, this mango is known for its exceptional sweetness, smooth texture, and rich aroma. The fruit is medium-sized with a golden-yellow skin when ripe.

**Amrapali - The Hybrid Wonder**
Developed through cross-breeding, Amrapali is a relatively new variety that has gained immense popularity. It's known for its consistent quality, good shelf life, and excellent taste. The fruit is medium to large-sized with a beautiful orange-red blush.

**Harivanga - The Traditional Favorite**
This traditional variety is characterized by its green skin even when ripe, which often confuses buyers. However, the flesh inside is incredibly sweet and aromatic. Harivanga mangoes are primarily grown in the northern districts.

**Lengra - The Classic Choice**
Lengra is one of the oldest and most beloved varieties in Bangladesh. Known for its rich, sweet taste and smooth texture, it's perfect for both eating fresh and making traditional desserts.

**Growing Conditions and Seasons**
Most mango varieties in Bangladesh ripen between April and July, with peak season being May and June. The best mangoes come from the northwestern districts, particularly Rajshahi, Chapainawabganj, and Dinajpur, where the soil and climate conditions are ideal.

**Nutritional Benefits**
Mangoes are rich in vitamins A and C, dietary fiber, and antioxidants. They support immune function, eye health, and digestive health. A single mango can provide up to 100% of your daily vitamin C requirement.

**Tips for Selecting Quality Mangoes**
- Look for fruits that yield slightly to gentle pressure
- Check for a sweet aroma at the stem end
- Avoid mangoes with dark spots or wrinkled skin
- The color can vary by variety, so don't rely solely on color for ripeness`,
    contentBn: `বাংলাদেশ ১০০টিরও বেশি জাতের আমের আবাসস্থল, যা এটিকে বিশ্বের অন্যতম বৈচিত্র্যময় আম উৎপাদনকারী দেশে পরিণত করেছে। প্রতিটি জাতের নিজস্ব বৈশিষ্ট্য, স্বাদের প্রোফাইল এবং বৃদ্ধির মৌসুম রয়েছে।

**হিমসাগর - আমের রাজা**
হিমসাগর, যার আক্ষরিক অর্থ "বরফের সমুদ্র", বাংলাদেশের সেরা আমের জাত হিসেবে বিবেচিত। প্রধানত রাজশাহীতে চাষ করা হয়, এই আম তার ব্যতিক্রমী মিষ্টতা, মসৃণ গঠন এবং সমৃদ্ধ সুগন্ধের জন্য পরিচিত।

**আম্রপালি - হাইব্রিড বিস্ময়**
ক্রস-ব্রিডিংয়ের মাধ্যমে উৎপাদিত, আম্রপালি একটি অপেক্ষাকৃত নতুন জাত যা ব্যাপক জনপ্রিয়তা অর্জন করেছে। এটি তার সামঞ্জস্যপূর্ণ গুণমান, ভাল সংরক্ষণ ক্ষমতা এবং চমৎকার স্বাদের জন্য পরিচিত।

**হরিভাঙ্গা - ঐতিহ্যবাহী প্রিয়**
এই ঐতিহ্যবাহী জাতটি পাকলেও সবুজ ত্বকের জন্য চিহ্নিত, যা প্রায়ই ক্রেতাদের বিভ্রান্ত করে। তবে ভিতরের শাঁস অবিশ্বাস্যভাবে মিষ্টি এবং সুগন্ধযুক্ত।

**লেংড়া - ক্লাসিক পছন্দ**
লেংড়া বাংলাদেশের অন্যতম পুরানো এবং প্রিয় জাত। এর সমৃদ্ধ, মিষ্টি স্বাদ এবং মসৃণ গঠনের জন্য পরিচিত।

**পুষ্টিগত উপকারিতা**
আম ভিটামিন এ এবং সি, খাদ্যতালিকাগত ফাইবার এবং অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ। এগুলি রোগ প্রতিরোধ ক্ষমতা, চোখের স্বাস্থ্য এবং হজম স্বাস্থ্যকে সমর্থন করে।`,
    author: 'Dr. Rashida Khatun',
    authorBn: 'ড. রশিদা খাতুন',
    publishDate: '2025-03-15',
    readTime: 8,
    category: 'Fruit Guide',
    categoryBn: 'ফলের গাইড',
    tags: ['Mango', 'Varieties', 'Bangladesh', 'Nutrition'],
    tagsBn: ['আম', 'জাত', 'বাংলাদেশ', 'পুষ্টি'],
    image: 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg',
    featured: true,
    language: 'en'
  },
  {
    id: '2',
    title: 'লিচুর স্বাস্থ্য উপকারিতা ও সংরক্ষণ পদ্ধতি',
    titleBn: 'লিচুর স্বাস্থ্য উপকারিতা ও সংরক্ষণ পদ্ধতি',
    excerpt: 'লিচুর অসাধারণ স্বাস্থ্য উপকারিতা এবং কীভাবে এটি সঠিকভাবে সংরক্ষণ করবেন তা জানুন।',
    excerptBn: 'লিচুর অসাধারণ স্বাস্থ্য উপকারিতা এবং কীভাবে এটি সঠিকভাবে সংরক্ষণ করবেন তা জানুন।',
    content: `লিচু একটি অত্যন্ত পুষ্টিকর এবং সুস্বাদু ফল যা গ্রীষ্মকালে পাওয়া যায়। এই ফলটি শুধু স্বাদেই নয়, স্বাস্থ্যের জন্যও অত্যন্ত উপকারী।

**পুষ্টিগত মান**
লিচুতে প্রচুর পরিমাণে ভিটামিন সি রয়েছে, যা একটি মাঝারি আকারের লিচুতে দৈনিক প্রয়োজনের ১০০% পর্যন্ত থাকতে পারে। এছাড়াও এতে রয়েছে:
- ভিটামিন বি৬
- নিয়াসিন
- রিবোফ্লাভিন
- ফোলেট
- কপার
- পটাসিয়াম
- ফসফরাস
- ম্যাগনেসিয়াম

**স্বাস্থ্য উপকারিতা**

*রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি*
লিচুতে থাকা উচ্চ মাত্রার ভিটামিন সি রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে এবং সংক্রমণের বিরুদ্ধে লড়াই করতে সাহায্য করে।

*হৃদযন্ত্রের স্বাস্থ্য*
লিচুতে থাকা পটাসিয়াম রক্তচাপ নিয়ন্ত্রণে সাহায্য করে এবং হৃদযন্ত্রের স্বাস্থ্য ভাল রাখে।

*ত্বকের যত্ন*
ভিটামিন সি কোলাজেন উৎপাদনে সাহায্য করে, যা ত্বককে সুস্থ এবং উজ্জ্বল রাখে।

*হজম শক্তি*
লিচুতে থাকা ফাইবার হজম প্রক্রিয়া উন্নত করে এবং কোষ্ঠকাঠিন্য প্রতিরোধ করে।

**সংরক্ষণ পদ্ধতি**

*তাজা লিচু সংরক্ষণ*
- ঘরের তাপমাত্রায় ২-৩ দিন রাখা যায়
- ফ্রিজে ১-২ সপ্তাহ পর্যন্ত সংরক্ষণ করা যায়
- প্লাস্টিকের ব্যাগে রেখে ফ্রিজে রাখুন

*দীর্ঘমেয়াদী সংরক্ষণ*
- খোসা ছাড়িয়ে বীজ বের করে ফ্রিজারে রাখা যায়
- শুকিয়ে সংরক্ষণ করা যায়
- জ্যাম বা জেলি তৈরি করে সংরক্ষণ করা যায়

**সতর্কতা**
- অতিরিক্ত লিচু খাওয়া এড়িয়ে চলুন
- খালি পেটে বেশি লিচু খাবেন না
- ডায়াবেটিস রোগীরা পরিমিত পরিমাণে খান`,
    contentBn: `লিচু একটি অত্যন্ত পুষ্টিকর এবং সুস্বাদু ফল যা গ্রীষ্মকালে পাওয়া যায়। এই ফলটি শুধু স্বাদেই নয়, স্বাস্থ্যের জন্যও অত্যন্ত উপকারী।

**পুষ্টিগত মান**
লিচুতে প্রচুর পরিমাণে ভিটামিন সি রয়েছে, যা একটি মাঝারি আকারের লিচুতে দৈনিক প্রয়োজনের ১০০% পর্যন্ত থাকতে পারে। এছাড়াও এতে রয়েছে:
- ভিটামিন বি৬
- নিয়াসিন
- রিবোফ্লাভিন
- ফোলেট
- কপার
- পটাসিয়াম
- ফসফরাস
- ম্যাগনেসিয়াম

**স্বাস্থ্য উপকারিতা**

*রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি*
লিচুতে থাকা উচ্চ মাত্রার ভিটামিন সি রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে এবং সংক্রমণের বিরুদ্ধে লড়াই করতে সাহায্য করে।

*হৃদযন্ত্রের স্বাস্থ্য*
লিচুতে থাকা পটাসিয়াম রক্তচাপ নিয়ন্ত্রণে সাহায্য করে এবং হৃদযন্ত্রের স্বাস্থ্য ভাল রাখে।

*ত্বকের যত্ন*
ভিটামিন সি কোলাজেন উৎপাদনে সাহায্য করে, যা ত্বককে সুস্থ এবং উজ্জ্বল রাখে।

*হজম শক্তি*
লিচুতে থাকা ফাইবার হজম প্রক্রিয়া উন্নত করে এবং কোষ্ঠকাঠিন্য প্রতিরোধ করে।

**সংরক্ষণ পদ্ধতি**

*তাজা লিচু সংরক্ষণ*
- ঘরের তাপমাত্রায় ২-৩ দিন রাখা যায়
- ফ্রিজে ১-২ সপ্তাহ পর্যন্ত সংরক্ষণ করা যায়
- প্লাস্টিকের ব্যাগে রেখে ফ্রিজে রাখুন

*দীর্ঘমেয়াদী সংরক্ষণ*
- খোসা ছাড়িয়ে বীজ বের করে ফ্রিজারে রাখা যায়
- শুকিয়ে সংরক্ষণ করা যায়
- জ্যাম বা জেলি তৈরি করে সংরক্ষণ করা যায়

**সতর্কতা**
- অতিরিক্ত লিচু খাওয়া এড়িয়ে চলুন
- খালি পেটে বেশি লিচু খাবেন না
- ডায়াবেটিস রোগীরা পরিমিত পরিমাণে খান`,
    author: 'পুষ্টিবিদ ফারহানা আক্তার',
    authorBn: 'পুষ্টিবিদ ফারহানা আক্তার',
    publishDate: '2025-03-12',
    readTime: 6,
    category: 'Health & Nutrition',
    categoryBn: 'স্বাস্থ্য ও পুষ্টি',
    tags: ['লিচু', 'স্বাস্থ্য', 'পুষ্টি', 'সংরক্ষণ'],
    tagsBn: ['লিচু', 'স্বাস্থ্য', 'পুষ্টি', 'সংরক্ষণ'],
    image: 'https://images.pexels.com/photos/39288/lychee-fruit-fresh-food-39288.jpeg',
    featured: false,
    language: 'bn'
  },
  {
    id: '3',
    title: 'Seasonal Fruit Calendar: When to Buy What',
    titleBn: 'মৌসুমী ফলের ক্যালেন্ডার: কখন কী কিনবেন',
    excerpt: 'A comprehensive guide to seasonal fruits in Bangladesh and the best times to purchase them for optimal freshness and value.',
    excerptBn: 'বাংলাদেশের মৌসুমী ফলের একটি বিস্তৃত গাইড এবং সর্বোত্তম তাজা এবং মূল্যের জন্য কখন সেগুলি কিনতে হবে।',
    content: `Understanding the seasonal availability of fruits in Bangladesh can help you make better purchasing decisions, save money, and enjoy fruits at their peak freshness and nutritional value.

**Spring (March - May)**
This is the golden season for many beloved fruits:

*Mango Season Begins*
- Early varieties like Gopal Bhog start appearing in March
- Himsagar and Langra peak in April-May
- Best time to buy: Late April to early June

*Jackfruit Season*
- Young jackfruits (good for cooking) available from March
- Ripe jackfruits peak in May-June
- Best time to buy: May for the sweetest varieties

*Litchi Season*
- Short but sweet season from May to June
- Best time to buy: Mid-May for optimal sweetness

**Summer (June - August)**
*Late Mango Varieties*
- Fazli and Ashwina varieties
- Best time to buy: June-July

*Pineapple*
- Available year-round but peaks in summer
- Best time to buy: June-August for sweetest fruit

**Monsoon (September - November)**
*Guava Season*
- Fresh guavas start appearing
- Best time to buy: October-November

*Pomegranate*
- Local varieties become available
- Best time to buy: October-December

**Winter (December - February)**
*Citrus Fruits*
- Oranges, lemons, and limes peak
- Best time to buy: December-January

*Apple Season*
- Local apples from hilly regions
- Best time to buy: December-February

**Year-Round Fruits**
Some fruits are available throughout the year:
- Banana (best in winter months)
- Papaya (peaks in summer)
- Coconut (available year-round)

**Money-Saving Tips**
1. Buy fruits during their peak season for best prices
2. Purchase slightly unripe fruits if you plan to consume later
3. Buy in bulk during peak season and preserve
4. Avoid buying out-of-season fruits as they're often imported and expensive

**Quality Indicators by Season**
- Peak season fruits have better color, aroma, and taste
- Off-season fruits may lack flavor and nutritional value
- Seasonal fruits are typically more affordable and fresher`,
    contentBn: `বাংলাদেশে ফলের মৌসুমী প্রাপ্যতা বোঝা আপনাকে ভাল ক্রয় সিদ্ধান্ত নিতে, অর্থ সাশ্রয় করতে এবং ফলগুলি তাদের সর্বোচ্চ তাজা এবং পুষ্টিগত মূল্যে উপভোগ করতে সাহায্য করতে পারে।

**বসন্ত (মার্চ - মে)**
এটি অনেক প্রিয় ফলের জন্য সোনালী মৌসুম:

*আমের মৌসুম শুরু*
- গোপালভোগের মতো প্রাথমিক জাতগুলি মার্চে দেখা দিতে শুরু করে
- হিমসাগর এবং লেংড়া এপ্রিল-মে মাসে শীর্ষে থাকে
- কেনার সেরা সময়: এপ্রিলের শেষ থেকে জুনের প্রথম দিকে

*কাঁঠালের মৌসুম*
- কাঁচা কাঁঠাল (রান্নার জন্য ভাল) মার্চ থেকে পাওয়া যায়
- পাকা কাঁঠাল মে-জুন মাসে শীর্ষে থাকে
- কেনার সেরা সময়: সবচেয়ে মিষ্টি জাতের জন্য মে মাস

*লিচুর মৌসুম*
- মে থেকে জুন পর্যন্ত ছোট কিন্তু মিষ্টি মৌসুম
- কেনার সেরা সময়: সর্বোত্তম মিষ্টতার জন্য মে মাসের মাঝামাঝি

**গ্রীষ্ম (জুন - আগস্ট)**
*দেরী আমের জাত*
- ফজলি এবং আশ্বিনা জাত
- কেনার সেরা সময়: জুন-জুলাই

*আনারস*
- সারা বছর পাওয়া যায় কিন্তু গ্রীষ্মে শীর্ষে থাকে
- কেনার সেরা সময়: সবচেয়ে মিষ্টি ফলের জন্য জুন-আগস্ট

**বর্ষা (সেপ্টেম্বর - নভেম্বর)**
*পেয়ারার মৌসুম*
- তাজা পেয়ারা দেখা দিতে শুরু করে
- কেনার সেরা সময়: অক্টোবর-নভেম্বর

*ডালিমের মৌসুম*
- স্থানীয় জাতগুলি পাওয়া যায়
- কেনার সেরা সময়: অক্টোবর-ডিসেম্বর

**শীত (ডিসেম্বর - ফেব্রুয়ারি)**
*সাইট্রাস ফল*
- কমলা, লেবু এবং কাগজি লেবু শীর্ষে থাকে
- কেনার সেরা সময়: ডিসেম্বর-জানুয়ারি

*আপেলের মৌসুম*
- পাহাড়ি অঞ্চল থেকে স্থানীয় আপেল
- কেনার সেরা সময়: ডিসেম্বর-ফেব্রুয়ারি`,
    author: 'Agricultural Expert Karim Uddin',
    authorBn: 'কৃষি বিশেষজ্ঞ করিম উদ্দিন',
    publishDate: '2025-03-10',
    readTime: 7,
    category: 'Seasonal Guide',
    categoryBn: 'মৌসুমী গাইড',
    tags: ['Seasonal', 'Calendar', 'Buying Guide', 'Fresh Fruits'],
    tagsBn: ['মৌসুমী', 'ক্যালেন্ডার', 'ক্রয় গাইড', 'তাজা ফল'],
    image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg',
    featured: true,
    language: 'en'
  },
  {
    id: '4',
    title: 'কাঁঠালের পুষ্টিগুণ ও রান্নার পদ্ধতি',
    titleBn: 'কাঁঠালের পুষ্টিগুণ ও রান্নার পদ্ধতি',
    excerpt: 'কাঁঠালের অসাধারণ পুষ্টিগুণ এবং বিভিন্ন রান্নার পদ্ধতি সম্পর্কে জানুন।',
    excerptBn: 'কাঁঠালের অসাধারণ পুষ্টিগুণ এবং বিভিন্ন রান্নার পদ্ধতি সম্পর্কে জানুন।',
    content: `কাঁঠাল বাংলাদেশের জাতীয় ফল এবং এটি শুধুমাত্র সুস্বাদুই নয়, অত্যন্ত পুষ্টিকরও। কাঁচা এবং পাকা উভয় অবস্থায়ই এটি খাওয়া যায় এবং প্রতিটির আলাদা পুষ্টিগুণ ও ব্যবহার রয়েছে।

**পুষ্টিগত মান (প্রতি ১০০ গ্রামে)**
- ক্যালোরি: ৯৫
- কার্বোহাইড্রেট: ২৩ গ্রাম
- প্রোটিন: ১.৭ গ্রাম
- ফাইবার: ১.৫ গ্রাম
- ভিটামিন সি: ১৩.৭ মিগ্রা
- ভিটামিন এ: ৫ মাইক্রোগ্রাম
- পটাসিয়াম: ৪৪৮ মিগ্রা
- ম্যাগনেসিয়াম: ২৯ মিগ্রা

**স্বাস্থ্য উপকারিতা**

*রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি*
কাঁঠালে থাকা ভিটামিন সি এবং অ্যান্টিঅক্সিডেন্ট রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে।

*হজম শক্তি উন্নতি*
উচ্চ ফাইবার সামগ্রী হজম প্রক্রিয়া উন্নত করে এবং কোষ্ঠকাঠিন্য প্রতিরোধ করে।

*হৃদযন্ত্রের স্বাস্থ্য*
পটাসিয়াম রক্তচাপ নিয়ন্ত্রণে সাহায্য করে এবং হৃদযন্ত্রের স্বাস্থ্য ভাল রাখে।

*ওজন নিয়ন্ত্রণ*
কম ক্যালোরি এবং উচ্চ ফাইবার ওজন নিয়ন্ত্রণে সাহায্য করে।

**কাঁচা কাঁঠালের রান্না**

*কাঁঠাল ভর্তা*
উপকরণ:
- কাঁচা কাঁঠাল ৫০০ গ্রাম
- পেঁয়াজ ২টি
- রসুন ৫-৬ কোয়া
- কাঁচা মরিচ ৩-৪টি
- তেল ৩ টেবিল চামচ
- লবণ স্বাদমতো

প্রণালী:
১. কাঁঠাল সিদ্ধ করে নিন
২. ভাল করে মেশে নিন
৩. পেঁয়াজ, রসুন, মরিচ কুচি করে ভেজে নিন
৪. সিদ্ধ কাঁঠাল দিয়ে ভেজে নিন
৫. লবণ ও মসলা দিয়ে পরিবেশন করুন

*কাঁঠালের তরকারি*
উপকরণ:
- কাঁচা কাঁঠাল ৫০০ গ্রাম
- আলু ২টি
- পেঁয়াজ ১টি
- হলুদ গুঁড়া ১ চা চামচ
- মরিচ গুঁড়া ১ চা চামচ
- তেল ৪ টেবিল চামচ

প্রণালী:
১. কাঁঠাল ও আলু কেটে নিন
২. তেলে পেঁয়াজ ভেজে নিন
৩. মসলা দিয়ে কাঁঠাল ও আলু দিন
৪. পানি দিয়ে রান্না করুন
৫. নরম হলে নামিয়ে পরিবেশন করুন

**পাকা কাঁঠালের ব্যবহার**

*কাঁঠালের পায়েস*
- দুধ, চিনি, এলাচ দিয়ে পায়েস তৈরি করুন
- পাকা কাঁঠালের কোয়া দিয়ে সুস্বাদু মিষ্টি তৈরি হয়

*কাঁঠালের জুস*
- পাকা কাঁঠাল, দুধ, চিনি দিয়ে জুস তৈরি করুন
- বরফ দিয়ে ঠান্ডা করে পরিবেশন করুন

**সংরক্ষণ পদ্ধতি**
- কাঁচা কাঁঠাল ফ্রিজে ৩-৪ দিন রাখা যায়
- পাকা কাঁঠাল ২-৩ দিনের মধ্যে খেয়ে ফেলুন
- কোয়া আলাদা করে ফ্রিজে সংরক্ষণ করুন

**সতর্কতা**
- অতিরিক্ত খাওয়া এড়িয়ে চলুন
- ডায়াবেটিস রোগীরা পরিমিত পরিমাণে খান
- কাঁঠাল কাটার সময় হাতে তেল লাগিয়ে নিন`,
    contentBn: `কাঁঠাল বাংলাদেশের জাতীয় ফল এবং এটি শুধুমাত্র সুস্বাদুই নয়, অত্যন্ত পুষ্টিকরও। কাঁচা এবং পাকা উভয় অবস্থায়ই এটি খাওয়া যায় এবং প্রতিটির আলাদা পুষ্টিগুণ ও ব্যবহার রয়েছে।

**পুষ্টিগত মান (প্রতি ১০০ গ্রামে)**
- ক্যালোরি: ৯৫
- কার্বোহাইড্রেট: ২৩ গ্রাম
- প্রোটিন: ১.৭ গ্রাম
- ফাইবার: ১.৫ গ্রাম
- ভিটামিন সি: ১৩.৭ মিগ্রা
- ভিটামিন এ: ৫ মাইক্রোগ্রাম
- পটাসিয়াম: ৪৪৮ মিগ্রা
- ম্যাগনেসিয়াম: ২৯ মিগ্রা

**স্বাস্থ্য উপকারিতা**

*রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি*
কাঁঠালে থাকা ভিটামিন সি এবং অ্যান্টিঅক্সিডেন্ট রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে।

*হজম শক্তি উন্নতি*
উচ্চ ফাইবার সামগ্রী হজম প্রক্রিয়া উন্নত করে এবং কোষ্ঠকাঠিন্য প্রতিরোধ করে।

*হৃদযন্ত্রের স্বাস্থ্য*
পটাসিয়াম রক্তচাপ নিয়ন্ত্রণে সাহায্য করে এবং হৃদযন্ত্রের স্বাস্থ্য ভাল রাখে।

*ওজন নিয়ন্ত্রণ*
কম ক্যালোরি এবং উচ্চ ফাইবার ওজন নিয়ন্ত্রণে সাহায্য করে।

**কাঁচা কাঁঠালের রান্না**

*কাঁঠাল ভর্তা*
উপকরণ:
- কাঁচা কাঁঠাল ৫০০ গ্রাম
- পেঁয়াজ ২টি
- রসুন ৫-৬ কোয়া
- কাঁচা মরিচ ৩-৪টি
- তেল ৩ টেবিল চামচ
- লবণ স্বাদমতো

প্রণালী:
১. কাঁঠাল সিদ্ধ করে নিন
২. ভাল করে মেশে নিন
৩. পেঁয়াজ, রসুন, মরিচ কুচি করে ভেজে নিন
৪. সিদ্ধ কাঁঠাল দিয়ে ভেজে নিন
৫. লবণ ও মসলা দিয়ে পরিবেশন করুন

*কাঁঠালের তরকারি*
উপকরণ:
- কাঁচা কাঁঠাল ৫০০ গ্রাম
- আলু ২টি
- পেঁয়াজ ১টি
- হলুদ গুঁড়া ১ চা চামচ
- মরিচ গুঁড়া ১ চা চামচ
- তেল ৪ টেবিল চামচ

প্রণালী:
১. কাঁঠাল ও আলু কেটে নিন
২. তেলে পেঁয়াজ ভেজে নিন
৩. মসলা দিয়ে কাঁঠাল ও আলু দিন
৪. পানি দিয়ে রান্না করুন
৫. নরম হলে নামিয়ে পরিবেশন করুন

**পাকা কাঁঠালের ব্যবহার**

*কাঁঠালের পায়েস*
- দুধ, চিনি, এলাচ দিয়ে পায়েস তৈরি করুন
- পাকা কাঁঠালের কোয়া দিয়ে সুস্বাদু মিষ্টি তৈরি হয়

*কাঁঠালের জুস*
- পাকা কাঁঠাল, দুধ, চিনি দিয়ে জুস তৈরি করুন
- বরফ দিয়ে ঠান্ডা করে পরিবেশন করুন

**সংরক্ষণ পদ্ধতি**
- কাঁচা কাঁঠাল ফ্রিজে ৩-৪ দিন রাখা যায়
- পাকা কাঁঠাল ২-৩ দিনের মধ্যে খেয়ে ফেলুন
- কোয়া আলাদা করে ফ্রিজে সংরক্ষণ করুন

**সতর্কতা**
- অতিরিক্ত খাওয়া এড়িয়ে চলুন
- ডায়াবেটিস রোগীরা পরিমিত পরিমাণে খান
- কাঁঠাল কাটার সময় হাতে তেল লাগিয়ে নিন`,
    author: 'শেফ রহিমা বেগম',
    authorBn: 'শেফ রহিমা বেগম',
    publishDate: '2025-03-08',
    readTime: 9,
    category: 'Recipes & Cooking',
    categoryBn: 'রেসিপি ও রান্না',
    tags: ['কাঁঠাল', 'রেসিপি', 'পুষ্টি', 'রান্না'],
    tagsBn: ['কাঁঠাল', 'রেসিপি', 'পুষ্টি', 'রান্না'],
    image: 'https://images.pexels.com/photos/28099671/pexels-photo-28099671.jpeg',
    featured: false,
    language: 'bn'
  },
  {
    id: '5',
    title: 'Dragon Fruit: The Exotic Superfruit',
    titleBn: 'ড্রাগন ফল: বিদেশী সুপারফ্রুট',
    excerpt: 'Discover the nutritional benefits and growing popularity of dragon fruit in Bangladesh\'s hill districts.',
    excerptBn: 'বাংলাদেশের পাহাড়ি জেলাগুলিতে ড্রাগন ফলের পুষ্টিগত উপকারিতা এবং ক্রমবর্ধমান জনপ্রিয়তা আবিষ্কার করুন।',
    content: `Dragon fruit, also known as pitaya, is rapidly gaining popularity in Bangladesh, particularly in the hill districts of Chittagong Hill Tracts. This exotic fruit is not only visually stunning but also packed with nutrients and health benefits.

**What is Dragon Fruit?**
Dragon fruit is a tropical cactus fruit native to Central America but now cultivated worldwide. The fruit has a distinctive appearance with bright pink or yellow skin and white or red flesh dotted with tiny black seeds.

**Varieties Grown in Bangladesh**
1. **White-fleshed Dragon Fruit** - Most common variety with sweet, mild flavor
2. **Red-fleshed Dragon Fruit** - Slightly sweeter with more intense color
3. **Yellow Dragon Fruit** - Sweetest variety but less common

**Nutritional Profile (per 100g)**
- Calories: 60
- Carbohydrates: 13g
- Fiber: 3g
- Protein: 1.2g
- Vitamin C: 3mg
- Iron: 0.74mg
- Magnesium: 18mg
- Calcium: 8.5mg

**Health Benefits**

*Rich in Antioxidants*
Dragon fruit contains betalains, which give the red variety its color and provide powerful antioxidant properties that help fight inflammation and oxidative stress.

*Supports Immune System*
The vitamin C content, though moderate, contributes to immune system support along with other antioxidants.

*Promotes Digestive Health*
High fiber content aids digestion and promotes healthy gut bacteria growth.

*Heart Health*
The fruit's natural compounds may help reduce cholesterol levels and support cardiovascular health.

*Hydration*
With about 90% water content, dragon fruit is excellent for hydration, especially in hot weather.

**Growing Conditions in Bangladesh**
Dragon fruit thrives in the hill districts due to:
- Well-drained soil
- Moderate rainfall
- Warm temperatures year-round
- Good air circulation

**Cultivation Areas**
- Rangamati
- Khagrachari
- Bandarban
- Some areas of Sylhet

**How to Select and Store**
*Selection Tips:*
- Choose fruits with bright, even-colored skin
- Avoid fruits with dark spots or soft areas
- The fruit should yield slightly to pressure when ripe

*Storage:*
- Ripe dragon fruit can be stored in the refrigerator for up to 5 days
- Unripe fruit can be left at room temperature to ripen
- Cut fruit should be consumed within 2 days

**How to Eat Dragon Fruit**
1. Cut the fruit in half lengthwise
2. Scoop out the flesh with a spoon, or
3. Peel the skin and slice the flesh
4. The seeds are edible and add a slight crunch

**Culinary Uses**
- Eat fresh as a snack
- Add to fruit salads
- Blend into smoothies
- Use as a garnish for desserts
- Make dragon fruit juice

**Economic Impact**
Dragon fruit cultivation is providing new income opportunities for farmers in hill districts, with prices ranging from ৳200-400 per kg depending on variety and season.

**Future Prospects**
As awareness of dragon fruit's health benefits grows, demand is increasing in urban areas. The government is supporting cultivation through agricultural extension programs, making it a promising crop for sustainable agriculture in Bangladesh.`,
    contentBn: `ড্রাগন ফল, যা পিতায়া নামেও পরিচিত, বাংলাদেশে, বিশেষ করে পার্বত্য চট্টগ্রামের পাহাড়ি জেলাগুলিতে দ্রুত জনপ্রিয়তা অর্জন করছে। এই বিদেশী ফলটি শুধুমাত্র দৃশ্যত আকর্ষণীয়ই নয়, পুষ্টি এবং স্বাস্থ্য উপকারিতায়ও ভরপুর।

**ড্রাগন ফল কী?**
ড্রাগন ফল একটি গ্রীষ্মমন্ডলীয় ক্যাকটাস ফল যা মূলত মধ্য আমেরিকার স্থানীয় কিন্তু এখন বিশ্বব্যাপী চাষ করা হয়। ফলটির একটি স্বতন্ত্র চেহারা রয়েছে উজ্জ্বল গোলাপী বা হলুদ ত্বক এবং ছোট কালো বীজ দিয়ে বিন্দুযুক্ত সাদা বা লাল শাঁস।

**বাংলাদেশে চাষ করা জাত**
১. **সাদা শাঁসের ড্রাগন ফল** - মিষ্টি, হালকা স্বাদের সবচেয়ে সাধারণ জাত
২. **লাল শাঁসের ড্রাগন ফল** - আরও তীব্র রঙের সাথে সামান্য মিষ্টি
৩. **হলুদ ড্রাগন ফল** - সবচেয়ে মিষ্টি জাত কিন্তু কম সাধারণ

**পুষ্টিগত প্রোফাইল (প্রতি ১০০ গ্রামে)**
- ক্যালোরি: ৬০
- কার্বোহাইড্রেট: ১৩ গ্রাম
- ফাইবার: ৩ গ্রাম
- প্রোটিন: ১.২ গ্রাম
- ভিটামিন সি: ৩ মিগ্রা
- আয়রন: ০.৭৪ মিগ্রা
- ম্যাগনেসিয়াম: ১৮ মিগ্রা
- ক্যালসিয়াম: ৮.৫ মিগ্রা

**স্বাস্থ্য উপকারিতা**

*অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ*
ড্রাগন ফলে বেটালেইন রয়েছে, যা লাল জাতকে তার রঙ দেয় এবং শক্তিশালী অ্যান্টিঅক্সিডেন্ট বৈশিষ্ট্য প্রদান করে যা প্রদাহ এবং অক্সিডেটিভ স্ট্রেসের বিরুদ্ধে লড়াই করতে সাহায্য করে।

*রোগ প্রতিরোধ ক্ষমতা সমর্থন করে*
ভিটামিন সি সামগ্রী, যদিও মাঝারি, অন্যান্য অ্যান্টিঅক্সিডেন্টের সাথে রোগ প্রতিরোধ ক্ষমতা সমর্থনে অবদান রাখে।

*হজম স্বাস্থ্য প্রচার করে*
উচ্চ ফাইবার সামগ্রী হজমে সাহায্য করে এবং স্বাস্থ্যকর অন্ত্রের ব্যাকটেরিয়া বৃদ্ধি প্রচার করে।

*হৃদযন্ত্রের স্বাস্থ্য*
ফলের প্রাকৃতিক যৌগগুলি কোলেস্টেরলের মাত্রা কমাতে এবং কার্ডিওভাসকুলার স্বাস্থ্য সমর্থন করতে সাহায্য করতে পারে।

*হাইড্রেশন*
প্রায় ৯০% জলের সামগ্রী সহ, ড্রাগন ফল হাইড্রেশনের জন্য চমৎকার, বিশেষ করে গরম আবহাওয়ায়।

**বাংলাদেশে চাষের অবস্থা**
ড্রাগন ফল পাহাড়ি জেলাগুলিতে সমৃদ্ধ হয় কারণ:
- ভাল নিষ্কাশিত মাটি
- মাঝারি বৃষ্টিপাত
- সারা বছর উষ্ণ তাপমাত্রা
- ভাল বায়ু সঞ্চালন

**চাষের এলাকা**
- রাঙামাটি
- খাগড়াছড়ি
- বান্দরবান
- সিলেটের কিছু এলাকা`,
    author: 'Horticulturist Dr. Nasir Ahmed',
    authorBn: 'উদ্যানতত্ত্ববিদ ড. নাসির আহমেদ',
    publishDate: '2025-03-05',
    readTime: 10,
    category: 'Exotic Fruits',
    categoryBn: 'বিদেশী ফল',
    tags: ['Dragon Fruit', 'Exotic', 'Hill Districts', 'Nutrition'],
    tagsBn: ['ড্রাগন ফল', 'বিদেশী', 'পাহাড়ি জেলা', 'পুষ্টি'],
    image: 'https://images.pexels.com/photos/2907428/pexels-photo-2907428.jpeg',
    featured: true,
    language: 'en'
  },
  {
    id: '6',
    title: 'পেয়ারার পুষ্টিগুণ ও ব্যবহার',
    titleBn: 'পেয়ারার পুষ্টিগুণ ও ব্যবহার',
    excerpt: 'স্বাদ ও পুষ্টিতে ভরপুর পেয়ারার অসাধারণ উপকারিতা এবং বিভিন্ন ব্যবহার সম্পর্কে জানুন।',
    excerptBn: 'স্বাদ ও পুষ্টিতে ভরপুর পেয়ারার অসাধারণ উপকারিতা এবং বিভিন্ন ব্যবহার সম্পর্কে জানুন।',
    content: `পেয়ারা বাংলাদেশের অন্যতম জনপ্রিয় ফল। এটি সারা বছর পাওয়া যায় এবং স্বল্প দামে সহজলভ্য হওয়ায় সাধারণ মানুষের মাঝে ব্যাপক গ্রহণযোগ্যতা রয়েছে। শুধু স্বাদেই নয়, পেয়ারা পুষ্টিগুণেও ভরপুর।

**পুষ্টিগত মান (প্রতি ১০০ গ্রামে)**
- ক্যালোরি: ৬৮  
- কার্বোহাইড্রেট: ১৪ গ্রাম  
- প্রোটিন: ২.৬ গ্রাম  
- ফাইবার: ৫.৪ গ্রাম  
- ভিটামিন সি: ২২৮.৩ মিগ্রা  
- ভিটামিন এ: ৩১ মাইক্রোগ্রাম  
- ক্যালসিয়াম: ১৮ মিগ্রা  
- আয়রন: ০.৩ মিগ্রা  

**স্বাস্থ্য উপকারিতা**

*ইমিউন সিস্টেম শক্তিশালী করে*  
উচ্চ পরিমাণে ভিটামিন সি থাকার কারণে পেয়ারা দেহের রোগ প্রতিরোধ ক্ষমতা বাড়ায়।

*হজমে সহায়ক*  
ফাইবার সমৃদ্ধ হওয়ায় এটি হজমে সাহায্য করে এবং কোষ্ঠকাঠিন্য দূর করে।

*ডায়াবেটিস নিয়ন্ত্রণে সহায়ক*  
পেয়ারার গ্লাইসেমিক সূচক কম হওয়ায় এটি রক্তে শর্করার পরিমাণ নিয়ন্ত্রণে সহায়তা করে।

*ওজন কমাতে সাহায্য করে*  
নিম্ন ক্যালোরি ও উচ্চ ফাইবারের কারণে এটি ডায়েটিং-এর জন্য উপযোগী ফল।

*ত্বক ও চোখের যত্নে*  
ভিটামিন এ ও অ্যান্টিঅক্সিডেন্ট ত্বকের উজ্জ্বলতা বাড়ায় এবং চোখের স্বাস্থ্য ভালো রাখে।

**পেয়ারার ব্যবহার**

*কাঁচা খাওয়া*  
পেয়ারা সাধারণত কাঁচা অবস্থায় খাওয়া হয়, সাথে লবণ-মরিচ দিয়ে।

*চাটনি ও আচার*  
পেয়ারা দিয়ে তৈরি আচার ও চাটনি খাবারের স্বাদ বাড়ায়।

*জ্যাম ও জেলি*  
পাকা পেয়ারা দিয়ে সুস্বাদু জ্যাম, জেলি তৈরি করা যায়।

*পেয়ারা জুস*  
পাকা পেয়ারা, পানি ও চিনি মিশিয়ে জুস তৈরি করা যায়।

**সংরক্ষণ পদ্ধতি**
- ফ্রিজে সংরক্ষণ করলে ৪-৫ দিন ভালো থাকে  
- পাকা পেয়ারা ২ দিনের মধ্যে খেয়ে ফেলা উত্তম  
- কাটা পেয়ারা টুপার বা ঢাকনাযুক্ত পাত্রে সংরক্ষণ করুন

**সতর্কতা**
- অতিরিক্ত খাওয়া এড়িয়ে চলুন, পেটের গ্যাস তৈরি হতে পারে  
- টক জাতের পেয়ারা পেট খারাপের কারণ হতে পারে, পরিমিতভাবে খান  
- ডায়াবেটিস রোগীরা ডাক্তারের পরামর্শ অনুযায়ী খেতে পারেন`,
    contentBn: `পেয়ারা বাংলাদেশের অন্যতম জনপ্রিয় ফল। এটি সারা বছর পাওয়া যায় এবং স্বল্প দামে সহজলভ্য হওয়ায় সাধারণ মানুষের মাঝে ব্যাপক গ্রহণযোগ্যতা রয়েছে। শুধু স্বাদেই নয়, পেয়ারা পুষ্টিগুণেও ভরপুর।

**পুষ্টিগত মান (প্রতি ১০০ গ্রামে)**
- ক্যালোরি: ৬৮  
- কার্বোহাইড্রেট: ১৪ গ্রাম  
- প্রোটিন: ২.৬ গ্রাম  
- ফাইবার: ৫.৪ গ্রাম  
- ভিটামিন সি: ২২৮.৩ মিগ্রা  
- ভিটামিন এ: ৩১ মাইক্রোগ্রাম  
- ক্যালসিয়াম: ১৮ মিগ্রা  
- আয়রন: ০.৩ মিগ্রা  

**স্বাস্থ্য উপকারিতা**

*ইমিউন সিস্টেম শক্তিশালী করে*  
উচ্চ পরিমাণে ভিটামিন সি থাকার কারণে পেয়ারা দেহের রোগ প্রতিরোধ ক্ষমতা বাড়ায়।

*হজমে সহায়ক*  
ফাইবার সমৃদ্ধ হওয়ায় এটি হজমে সাহায্য করে এবং কোষ্ঠকাঠিন্য দূর করে।

*ডায়াবেটিস নিয়ন্ত্রণে সহায়ক*  
পেয়ারার গ্লাইসেমিক সূচক কম হওয়ায় এটি রক্তে শর্করার পরিমাণ নিয়ন্ত্রণে সহায়তা করে।

*ওজন কমাতে সাহায্য করে*  
নিম্ন ক্যালোরি ও উচ্চ ফাইবারের কারণে এটি ডায়েটিং-এর জন্য উপযোগী ফল।

*ত্বক ও চোখের যত্নে*  
ভিটামিন এ ও অ্যান্টিঅক্সিডেন্ট ত্বকের উজ্জ্বলতা বাড়ায় এবং চোখের স্বাস্থ্য ভালো রাখে।

**পেয়ারার ব্যবহার**

*কাঁচা খাওয়া*  
পেয়ারা সাধারণত কাঁচা অবস্থায় খাওয়া হয়, সাথে লবণ-মরিচ দিয়ে।

*চাটনি ও আচার*  
পেয়ারা দিয়ে তৈরি আচার ও চাটনি খাবারের স্বাদ বাড়ায়।

*জ্যাম ও জেলি*  
পাকা পেয়ারা দিয়ে সুস্বাদু জ্যাম, জেলি তৈরি করা যায়।

*পেয়ারা জুস*  
পাকা পেয়ারা, পানি ও চিনি মিশিয়ে জুস তৈরি করা যায়।

**সংরক্ষণ পদ্ধতি**
- ফ্রিজে সংরক্ষণ করলে ৪-৫ দিন ভালো থাকে  
- পাকা পেয়ারা ২ দিনের মধ্যে খেয়ে ফেলা উত্তম  
- কাটা পেয়ারা টুপার বা ঢাকনাযুক্ত পাত্রে সংরক্ষণ করুন

**সতর্কতা**
- অতিরিক্ত খাওয়া এড়িয়ে চলুন, পেটের গ্যাস তৈরি হতে পারে  
- টক জাতের পেয়ারা পেট খারাপের কারণ হতে পারে, পরিমিতভাবে খান  
- ডায়াবেটিস রোগীরা ডাক্তারের পরামর্শ অনুযায়ী খেতে পারেন`,
    author: 'পুষ্টিবিদ সালমা খাতুন',
    authorBn: 'পুষ্টিবিদ সালমা খাতুন',
    publishDate: '2025-07-27',
    readTime: 8,
    category: 'পুষ্টি ও স্বাস্থ্য',
    categoryBn: 'পুষ্টি ও স্বাস্থ্য',
    tags: ['পেয়ারা', 'পুষ্টি', 'ফল', 'স্বাস্থ্য'],
    tagsBn: ['পেয়ারা', 'পুষ্টি', 'ফল', 'স্বাস্থ্য'],
    image: 'https://images.pexels.com/photos/5945840/pexels-photo-5945840.jpeg',
    featured: false,
    language: 'bn'
  }

];

const Blog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'bn'>('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const categories = ['All', 'Fruit Guide', 'Health & Nutrition', 'Seasonal Guide', 'Recipes & Cooking', 'Exotic Fruits'];
  const categoriesBn = ['সব', 'ফলের গাইড', 'স্বাস্থ্য ও পুষ্টি', 'মৌসুমী গাইড', 'রেসিপি ও রান্না', 'বিদেশী ফল'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.titleBn.includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerptBn.includes(searchTerm);

    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || post.language === selectedLanguage;

    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const BlogPostModal = ({ post, onClose }: { post: BlogPost; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={post.image}
            alt={post.language === 'bn' ? post.titleBn : post.title}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center">
                <Calendar size={16} className="mr-1" />
                {formatDate(post.publishDate)}
              </span>
              <span className="flex items-center">
                <User size={16} className="mr-1" />
                {post.language === 'bn' ? post.authorBn : post.author}
              </span>
              <span className="flex items-center">
                <Clock size={16} className="mr-1" />
                {post.readTime} min read
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {post.language === 'bn' ? post.titleBn : post.title}
            </h1>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {post.language === 'bn' ? post.categoryBn : post.category}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {post.language === 'bn' ? 'বাংলা' : 'English'}
              </span>
            </div>
          </div>

          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {post.language === 'bn' ? post.contentBn : post.content}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(post.language === 'bn' ? post.tagsBn : post.tags).map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  <Tag size={12} className="inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Fruit Panda Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the world of fruits through our expert articles, nutritional guides, and seasonal insights.
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-2">
            ফলের জগৎ আবিষ্কার করুন আমাদের বিশেষজ্ঞ নিবন্ধ, পুষ্টি গাইড এবং মৌসুমী অন্তর্দৃষ্টির মাধ্যমে।
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search articles... / নিবন্ধ খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map((category, index) => (
                  <option key={category} value={category}>
                    {category} / {categoriesBn[index]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'all' | 'en' | 'bn')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Languages / সব ভাষা</option>
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-600 w-1 h-6 mr-3"></span>
              Featured Articles / বিশেষ নিবন্ধ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.language === 'bn' ? post.titleBn : post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {post.language === 'bn' ? 'বাংলা' : 'English'}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {formatDate(post.publishDate)}
                      </span>
                      <span className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {post.readTime} min
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {post.language === 'bn' ? post.titleBn : post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.language === 'bn' ? post.excerptBn : post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {post.language === 'bn' ? post.categoryBn : post.category}
                      </span>
                      <span className="text-green-600 font-medium flex items-center group-hover:translate-x-1 transition-transform">
                        Read More <ChevronRight size={16} className="ml-1" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-gray-600 w-1 h-6 mr-3"></span>
            All Articles / সব নিবন্ধ
          </h2>

          {regularPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
              <p className="text-gray-500 text-lg">আপনার মানদণ্ড অনুযায়ী কোন নিবন্ধ পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.language === 'bn' ? post.titleBn : post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {post.language === 'bn' ? 'বাংলা' : 'English'}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {formatDate(post.publishDate)}
                      </span>
                      <span className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {post.readTime} min
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {post.language === 'bn' ? post.titleBn : post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.language === 'bn' ? post.excerptBn : post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {post.language === 'bn' ? post.categoryBn : post.category}
                      </span>
                      <span className="text-green-600 font-medium flex items-center group-hover:translate-x-1 transition-transform">
                        Read More <ChevronRight size={16} className="ml-1" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Blog Post Modal */}
        {selectedPost && (
          <BlogPostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Blog;