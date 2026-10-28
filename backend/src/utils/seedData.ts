import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Report } from '../models/Report';
import { WaterTest } from '../models/WaterTest';
import { Alert } from '../models/Alert';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';

dotenv.config();

export const NORTHEAST_VILLAGES = [
  { name: 'Majuli Island', state: 'Assam', coordinates: [94.1848, 26.9602] as [number, number] },
  { name: 'Sohra (Cherrapunji)', state: 'Meghalaya', coordinates: [91.7323, 25.2986] as [number, number] },
  { name: 'Mawlynnong', state: 'Meghalaya', coordinates: [91.9056, 25.2014] as [number, number] },
  { name: 'Moirang (Loktak)', state: 'Manipur', coordinates: [93.7915, 24.5050] as [number, number] },
  { name: 'Ziro Valley', state: 'Arunachal Pradesh', coordinates: [93.8344, 27.5950] as [number, number] },
  { name: 'Mokokchung Village', state: 'Nagaland', coordinates: [94.5244, 26.3248] as [number, number] },
  { name: 'Haflong Hills', state: 'Assam', coordinates: [93.0298, 25.1764] as [number, number] }
];

export const seedDatabase = async () => {
  console.log('[Seeder] Clearing old records...');
  await User.deleteMany({});
  await Report.deleteMany({});
  await WaterTest.deleteMany({});
  await Alert.deleteMany({});
  await Notification.deleteMany({});
  await AuditLog.deleteMany({});

  console.log('[Seeder] Creating users (1 admin, 2 health workers, 5 citizens)...');

  // 1 Admin
  const admin = await User.create({
    name: 'Dr. Arindam Sharma',
    email: 'admin@smarthealth.ne.gov.in',
    password: 'Password123!',
    role: 'admin',
    village: 'Guwahati HQ',
    phone: '+91 98640 12345',
    isActive: true
  });

  // 2 Health Workers
  const hw1 = await User.create({
    name: 'Sister Mary Lyngdoh',
    email: 'mary.lyngdoh@health.meghalaya.gov.in',
    password: 'Password123!',
    role: 'health_worker',
    village: 'Sohra (Cherrapunji)',
    phone: '+91 94361 54321',
    isActive: true
  });

  const hw2 = await User.create({
    name: 'Biren Hazarika',
    email: 'biren.hazarika@health.assam.gov.in',
    password: 'Password123!',
    role: 'health_worker',
    village: 'Majuli Island',
    phone: '+91 99540 67890',
    isActive: true
  });

  // 5 Citizens
  const citizens = await User.create([
    {
      name: 'Rupjyoti Saikia',
      email: 'rupjyoti@majuli.in',
      password: 'Password123!',
      role: 'citizen',
      village: 'Majuli Island',
      phone: '+91 98540 11223',
      isActive: true
    },
    {
      name: 'Pynshngain Marbaniang',
      email: 'pynshngain@cherra.org',
      password: 'Password123!',
      role: 'citizen',
      village: 'Sohra (Cherrapunji)',
      phone: '+91 97740 44556',
      isActive: true
    },
    {
      name: 'Thoiba Singh',
      email: 'thoiba@loktak.net',
      password: 'Password123!',
      role: 'citizen',
      village: 'Moirang (Loktak)',
      phone: '+91 96120 77889',
      isActive: true
    },
    {
      name: 'Tage Tado',
      email: 'tage@ziro.org',
      password: 'Password123!',
      role: 'citizen',
      village: 'Ziro Valley',
      phone: '+91 94020 99001',
      isActive: true
    },
    {
      name: 'Imkong Jamir',
      email: 'imkong@mokokchung.org',
      password: 'Password123!',
      role: 'citizen',
      village: 'Mokokchung Village',
      phone: '+91 98620 33445',
      isActive: true
    }
  ]);

  console.log('[Seeder] Generating 35 sample community reports across Northeast villages...');
  const symptomSets = [
    ['diarrhea', 'vomiting', 'fever'],
    ['diarrhea', 'abdominal_pain'],
    ['vomiting', 'nausea', 'dehydration'],
    ['fever', 'abdominal_pain', 'diarrhea'],
    ['diarrhea', 'dehydration'],
    ['vomiting', 'fever']
  ];

  const sourceTypes: ('handpump' | 'well' | 'river' | 'pond' | 'pipeline')[] = [
    'handpump',
    'well',
    'river',
    'pond',
    'pipeline'
  ];

  const statuses: ('pending' | 'under_review' | 'verified' | 'resolved')[] = [
    'pending',
    'under_review',
    'verified',
    'resolved'
  ];

  const reports = [];
  const now = Date.now();

  for (let i = 0; i < 35; i++) {
    const vIndex = i % NORTHEAST_VILLAGES.length;
    const villageObj = NORTHEAST_VILLAGES[vIndex];
    const citizen = citizens[i % citizens.length];
    const symptoms = symptomSets[i % symptomSets.length];
    const sourceType = sourceTypes[i % sourceTypes.length];
    const status = statuses[i % statuses.length];

    // Jitter coordinates slightly around village center for realism
    const lngJitter = (Math.random() - 0.5) * 0.04;
    const latJitter = (Math.random() - 0.5) * 0.04;
    const coordinates: [number, number] = [
      villageObj.coordinates[0] + lngJitter,
      villageObj.coordinates[1] + latJitter
    ];

    // Distribute reported dates across past 10 days
    const daysAgo = Math.floor(Math.random() * 10);
    const reportedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 36000000);

    reports.push({
      userId: citizen._id,
      village: villageObj.name,
      sourceType,
      symptoms,
      description: `Turbid muddy water observed near the ${sourceType}. Several neighboring households complaining of sudden gastrointestinal discomfort.`,
      reportedAt,
      status,
      location: {
        type: 'Point',
        coordinates
      },
      assignedTo: villageObj.name.includes('Majuli') ? hw2._id : hw1._id,
      resolutionNotes:
        status === 'resolved'
          ? 'Chlorine disinfection tablets provided to community. Source flushed.'
          : status === 'verified'
          ? 'Field verification completed by local health staff. Water sample dispatched for biological testing.'
          : undefined
    });
  }

  const createdReports = await Report.insertMany(reports);
  console.log(`[Seeder] Inserted ${createdReports.length} reports.`);

  console.log('[Seeder] Creating water test records...');
  const waterTests = [
    {
      reportId: createdReports[0]._id,
      village: 'Majuli Island',
      sourceType: 'handpump',
      testedBy: hw2._id,
      testDate: new Date(now - 2 * 24 * 3600 * 1000),
      parameters: { pH: 6.2, turbidity: 8.5, chlorine: 0.05, coliform: true, ecoli: true },
      result: 'unsafe',
      notes: 'High fecal coliform and E. coli bacterial contamination detected following seasonal river swelling.',
      location: { type: 'Point', coordinates: NORTHEAST_VILLAGES[0].coordinates }
    },
    {
      reportId: createdReports[3]._id,
      village: 'Sohra (Cherrapunji)',
      sourceType: 'well',
      testedBy: hw1._id,
      testDate: new Date(now - 3 * 24 * 3600 * 1000),
      parameters: { pH: 6.8, turbidity: 4.2, chlorine: 0.2, coliform: true, ecoli: false },
      result: 'borderline',
      notes: 'Moderate turbidity with detectable total coliform. Chlorine dosage advised.',
      location: { type: 'Point', coordinates: NORTHEAST_VILLAGES[1].coordinates }
    },
    {
      reportId: createdReports[6]._id,
      village: 'Moirang (Loktak)',
      sourceType: 'pipeline',
      testedBy: hw1._id,
      testDate: new Date(now - 1 * 24 * 3600 * 1000),
      parameters: { pH: 7.2, turbidity: 1.1, chlorine: 0.5, coliform: false, ecoli: false },
      result: 'safe',
      notes: 'Water quality meets permissible drinking standards.',
      location: { type: 'Point', coordinates: NORTHEAST_VILLAGES[3].coordinates }
    },
    {
      village: 'Ziro Valley',
      sourceType: 'pond',
      testedBy: hw2._id,
      testDate: new Date(now - 4 * 24 * 3600 * 1000),
      parameters: { pH: 5.9, turbidity: 9.8, chlorine: 0.0, coliform: true, ecoli: true },
      result: 'unsafe',
      notes: 'Agricultural run-off detected in surface collection point.',
      location: { type: 'Point', coordinates: NORTHEAST_VILLAGES[4].coordinates }
    }
  ];

  await WaterTest.insertMany(waterTests);

  console.log('[Seeder] Creating early-warning risk alerts...');
  const alerts = [
    {
      village: 'Majuli Island',
      riskLevel: 'critical',
      reason:
        'Potential Risk – Based on Unverified Citizen Reports: Unsafe water test detected (fecal coliform + E. coli) combined with 8 symptom reports (6 diarrhea cases) within 7 days.',
      reportCount: 8,
      symptomsInvolved: ['diarrhea', 'vomiting', 'fever', 'dehydration'],
      status: 'active',
      generatedAt: new Date(now - 1 * 24 * 3600 * 1000)
    },
    {
      village: 'Sohra (Cherrapunji)',
      riskLevel: 'high',
      reason:
        'Potential Risk – Based on Unverified Citizen Reports: High clustering of 6 reports with elevated gastrointestinal complaints (4 diarrhea, 3 vomiting) within 7 days.',
      reportCount: 6,
      symptomsInvolved: ['diarrhea', 'vomiting', 'fever'],
      status: 'active',
      generatedAt: new Date(now - 2 * 24 * 3600 * 1000)
    },
    {
      village: 'Ziro Valley',
      riskLevel: 'medium',
      reason:
        'Potential Risk – Based on Unverified Citizen Reports: Moderate surge: 5 reports with 3 diarrhea and 2 fever complaints within 7 days.',
      reportCount: 5,
      symptomsInvolved: ['diarrhea', 'abdominal_pain', 'fever'],
      status: 'active',
      generatedAt: new Date(now - 3 * 24 * 3600 * 1000)
    },
    {
      village: 'Mokokchung Village',
      riskLevel: 'low',
      reason:
        'Potential Risk – Based on Unverified Citizen Reports: Elevated community reports (3 reports) requiring field observation.',
      reportCount: 3,
      symptomsInvolved: ['fever', 'abdominal_pain'],
      status: 'acknowledged',
      generatedAt: new Date(now - 5 * 24 * 3600 * 1000),
      notes: 'Field worker dispatched with testing kits.'
    }
  ];

  await Alert.insertMany(alerts);

  console.log('[Seeder] Creating notifications...');
  await Notification.create([
    {
      userId: hw2._id,
      title: 'CRITICAL EARLY WARNING: Majuli Island',
      message:
        'Potential Risk – Based on Unverified Citizen Reports: 8 reports of acute diarrhea linked to handpump contamination.',
      type: 'alert',
      isRead: false
    },
    {
      userId: hw1._id,
      title: 'HIGH ALERT: Sohra (Cherrapunji)',
      message:
        'Potential Risk – Based on Unverified Citizen Reports: Cluster of 6 gastrointestinal cases logged.',
      type: 'alert',
      isRead: false
    },
    {
      userId: citizens[0]._id,
      title: 'Surveillance Update',
      message: 'Your report regarding Majuli handpump water condition is currently under review by health workers.',
      type: 'status_update',
      isRead: true
    }
  ]);

  console.log('[Seeder] Database seeding completed successfully!');
};

// If run directly from CLI
if (require.main === module) {
  const run = async () => {
    try {
      const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-health-northeast';
      await mongoose.connect(connUri);
      console.log('Connected to MongoDB for seeding');
      await seedDatabase();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('Seeding failed:', err);
      process.exit(1);
    }
  };
  run();
}
