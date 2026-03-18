import { PrismaClient, ApplicationStatus, JobSourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AutoApply AI demo data...');

  const user = await prisma.user.upsert({
    where: { id: 'local-user' },
    update: { name: 'Demo User', email: 'demo@autoapply.ai' },
    create: { id: 'local-user', email: 'demo@autoapply.ai', name: 'Demo User' }
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: 'Senior Software Engineer',
      summary: 'TypeScript backend engineer focused on scalable platforms.',
      phone: '+1 555 010 2000',
      location: 'Remote, US',
      skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'React'],
      preferredLocations: ['Remote'],
      preferredIndustries: ['SaaS', 'Developer Tools'],
      targetTitles: ['Senior Backend Engineer', 'Staff Engineer'],
      salaryTarget: 180000,
      visaInfo: 'Authorized to work in US',
      workHistory: [{ title: 'Senior Software Engineer', subtitle: 'Acme Cloud', startDate: '2021', endDate: 'Present' }],
      education: [{ title: 'B.S. Computer Science', subtitle: 'State University' }],
      certifications: ['AWS Certified Developer']
    },
    create: {
      userId: user.id,
      headline: 'Senior Software Engineer',
      summary: 'TypeScript backend engineer focused on scalable platforms.',
      phone: '+1 555 010 2000',
      location: 'Remote, US',
      skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'React'],
      preferredLocations: ['Remote'],
      preferredIndustries: ['SaaS', 'Developer Tools'],
      targetTitles: ['Senior Backend Engineer', 'Staff Engineer'],
      salaryTarget: 180000,
      visaInfo: 'Authorized to work in US',
      workHistory: [{ title: 'Senior Software Engineer', subtitle: 'Acme Cloud', startDate: '2021', endDate: 'Present' }],
      education: [{ title: 'B.S. Computer Science', subtitle: 'State University' }],
      certifications: ['AWS Certified Developer']
    }
  });

  const source = await prisma.jobSource.upsert({
    where: { id: 'demo-source' },
    update: { isEnabled: true },
    create: {
      id: 'demo-source',
      name: 'Demo Ingestion Source',
      sourceType: JobSourceType.greenhouse,
      baseUrl: 'https://boards.greenhouse.io/demo'
    }
  });

  const jobs = [
    {
      externalId: 'demo-job-1',
      title: 'Senior Backend Engineer',
      company: 'Acme Cloud',
      location: 'Remote (US)',
      compensation: '$170,000 - $210,000',
      description: 'Build backend services using TypeScript, Node.js, PostgreSQL, Redis.',
      sourceType: JobSourceType.greenhouse,
      sourceUrl: 'https://boards.greenhouse.io/demo/jobs/1',
      requirements: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
      easyApply: false
    },
    {
      externalId: 'demo-job-2',
      title: 'Full-Stack Engineer',
      company: 'Orbit Labs',
      location: 'New York, NY (Hybrid)',
      compensation: '$140,000 - $165,000',
      description: 'Build product features with TypeScript, React, GraphQL.',
      sourceType: JobSourceType.lever,
      sourceUrl: 'https://jobs.lever.co/demo/2',
      requirements: ['TypeScript', 'React', 'GraphQL'],
      easyApply: true
    },
    {
      externalId: 'demo-job-3',
      title: 'Platform Engineer',
      company: 'Northstar',
      location: 'Remote (Global)',
      compensation: '$185,000 - $220,000',
      description: 'Improve reliability and CI/CD with Terraform and Kubernetes.',
      sourceType: JobSourceType.greenhouse,
      sourceUrl: 'https://boards.greenhouse.io/demo/jobs/3',
      requirements: ['Terraform', 'Kubernetes', 'AWS'],
      easyApply: false
    }
  ];

  const createdJobs = [] as { id: string; title: string; score: number }[];
  for (const job of jobs) {
    const posting = await prisma.jobPosting.upsert({
      where: { externalId_sourceType: { externalId: job.externalId, sourceType: job.sourceType } },
      update: { ...job, sourceId: source.id },
      create: { ...job, sourceId: source.id }
    });

    const score = job.externalId === 'demo-job-1' ? 91 : job.externalId === 'demo-job-2' ? 74 : 68;
    await prisma.jobFitScore.upsert({
      where: { id: `fit-${posting.id}` },
      update: {
        score,
        matchingSkills: job.externalId === 'demo-job-1' ? ['TypeScript', 'Node.js', 'PostgreSQL'] : ['TypeScript'],
        missingSkills: job.externalId === 'demo-job-1' ? ['Kubernetes'] : ['Terraform'],
        concerns: job.externalId === 'demo-job-2' ? ['Hybrid location may be a mismatch'] : ['Potential infrastructure depth gap'],
        explanation: JSON.stringify({ pitch: 'Strong seeded match for early local runs.', mismatchNotes: [] })
      },
      create: {
        id: `fit-${posting.id}`,
        userId: user.id,
        jobPostingId: posting.id,
        score,
        matchingSkills: job.externalId === 'demo-job-1' ? ['TypeScript', 'Node.js', 'PostgreSQL'] : ['TypeScript'],
        missingSkills: job.externalId === 'demo-job-1' ? ['Kubernetes'] : ['Terraform'],
        concerns: job.externalId === 'demo-job-2' ? ['Hybrid location may be a mismatch'] : ['Potential infrastructure depth gap'],
        explanation: JSON.stringify({ pitch: 'Strong seeded match for early local runs.', mismatchNotes: [] })
      }
    });

    createdJobs.push({ id: posting.id, title: posting.title, score });
  }

  const appOne = await prisma.application.upsert({
    where: { id: 'demo-app-1' },
    update: { status: ApplicationStatus.prepared, fitScore: 91, notes: 'Resume tailored and ready for final review.', followUpDate: new Date('2026-03-20') },
    create: { id: 'demo-app-1', userId: user.id, jobPostingId: createdJobs[0].id, status: ApplicationStatus.prepared, fitScore: 91, notes: 'Resume tailored and ready for final review.', followUpDate: new Date('2026-03-20') }
  });

  await prisma.application.upsert({
    where: { id: 'demo-app-2' },
    update: { status: ApplicationStatus.applied, fitScore: 74, notes: 'Applied via company portal.', dateApplied: new Date('2026-03-14') },
    create: { id: 'demo-app-2', userId: user.id, jobPostingId: createdJobs[1].id, status: ApplicationStatus.applied, fitScore: 74, notes: 'Applied via company portal.', dateApplied: new Date('2026-03-14') }
  });

  await prisma.application.upsert({
    where: { id: 'demo-app-3' },
    update: { status: ApplicationStatus.interview, fitScore: 68, notes: 'Recruiter screen scheduled for next week.' },
    create: { id: 'demo-app-3', userId: user.id, jobPostingId: createdJobs[2].id, status: ApplicationStatus.interview, fitScore: 68, notes: 'Recruiter screen scheduled for next week.' }
  });

  await prisma.tailoredResumeVariant.upsert({
    where: { id: 'demo-summary-1' },
    update: {
      summary: 'Senior backend engineer with deep TypeScript experience building reliable, data-intensive services.',
      bulletSuggestions: ['Reduced API latency by 40% via query optimization and cache strategy.'],
      prioritizedSkills: ['TypeScript', 'Node.js', 'PostgreSQL']
    },
    create: {
      id: 'demo-summary-1',
      userId: user.id,
      applicationId: appOne.id,
      summary: 'Senior backend engineer with deep TypeScript experience building reliable, data-intensive services.',
      bulletSuggestions: ['Reduced API latency by 40% via query optimization and cache strategy.'],
      prioritizedSkills: ['TypeScript', 'Node.js', 'PostgreSQL']
    }
  });

  await prisma.outreachMessage.upsert({
    where: { id: 'demo-outreach-1' },
    update: {
      channel: 'linkedin',
      tone: 'professional',
      content: 'Hi team — I am excited about your backend role and would love to discuss how my TypeScript + distributed systems background can help.'
    },
    create: {
      id: 'demo-outreach-1',
      userId: user.id,
      applicationId: appOne.id,
      channel: 'linkedin',
      tone: 'professional',
      content: 'Hi team — I am excited about your backend role and would love to discuss how my TypeScript + distributed systems background can help.'
    }
  });

  console.log('✅ Demo seed completed.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed', error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
