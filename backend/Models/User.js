const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  token: String,
  device: String,
  browser: String,
  os: String,
  ip: String,
  location: String,
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ['user', 'admin', 'owner'], default: 'user' },
  isBanned: { type: Boolean, default: false },
  password: String,
  photo: String, // image filename or URL
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  careerProfile: {
    personal: {
      phone: { type: String, default: '' },
      gender: { type: String, default: '' },
      dateOfBirth: { type: String, default: '' }
    },
    preferences: {
      jobTypes: [{ type: String }],
      availability: { type: String, default: '' },
      preferredLocations: [{ type: String }]
    },
    profileSummary: { type: String, default: '' },
    keySkills: [{ type: String }],
    languages: [
      {
        name: { type: String, default: '' },
        proficiency: { type: String, default: '' }
      }
    ],
    education: [
      {
        degree: { type: String, default: '' },
        institute: { type: String, default: '' },
        graduationYear: { type: String, default: '' },
        courseType: { type: String, default: '' },
        score: { type: String, default: '' }
      }
    ],
    internships: [
      {
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        duration: { type: String, default: '' },
        description: { type: String, default: '' }
      }
    ],
    projects: [
      {
        title: { type: String, default: '' },
        technologies: [{ type: String }],
        description: { type: String, default: '' },
        link: { type: String, default: '' }
      }
    ],
    accomplishments: [{ type: String }],
    competitiveExams: [
      {
        examName: { type: String, default: '' },
        score: { type: String, default: '' },
        year: { type: String, default: '' }
      }
    ],
    employment: [
      {
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        duration: { type: String, default: '' },
        description: { type: String, default: '' }
      }
    ],
    academicAchievements: [{ type: String }],
    recruiterProfile: {
      basic: {
        headline: { type: String, default: '' },
        currentCompany: { type: String, default: '' },
        currentSalary: { type: String, default: '' },
        expectedSalary: { type: String, default: '' },
        noticePeriod: { type: String, default: '' }
      },
      contact: {
        emailVerified: { type: Boolean, default: false },
        phone: { type: String, default: '' },
        phoneVerified: { type: Boolean, default: false },
        address: { type: String, default: '' },
        preferredLocation: { type: String, default: '' },
        privacy: { type: String, default: 'recruiter' }
      },
      career: {
        industry: { type: String, default: '' },
        functionalArea: { type: String, default: '' },
        role: { type: String, default: '' },
        jobType: { type: String, default: '' },
        preferredShift: { type: String, default: '' },
        employmentType: { type: String, default: '' }
      },
      workExperience: [
        {
          companyName: { type: String, default: '' },
          role: { type: String, default: '' },
          startDate: { type: String, default: '' },
          endDate: { type: String, default: '' },
          description: { type: String, default: '' },
          keySkills: { type: String, default: '' }
        }
      ],
      education: [
        {
          degree: { type: String, default: '' },
          collegeName: { type: String, default: '' },
          yearOfPassing: { type: String, default: '' },
          score: { type: String, default: '' }
        }
      ],
      skills: {
        keySkills: [{ type: String }],
        secondarySkills: [{ type: String }],
        levels: [{ type: String }]
      },
      resume: {
        fileName: { type: String, default: '' },
        fileUrl: { type: String, default: '' },
        uploadedAt: { type: Date }
      },
      projects: [
        {
          title: { type: String, default: '' },
          description: { type: String, default: '' },
          techStack: { type: String, default: '' },
          githubLink: { type: String, default: '' },
          liveLink: { type: String, default: '' }
        }
      ],
      accomplishments: {
        certifications: [{ type: String }],
        awards: [{ type: String }],
        publications: [{ type: String }],
        patents: [{ type: String }]
      },
      onlineProfiles: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        portfolio: { type: String, default: '' }
      },
      summary: { type: String, default: '' }
    }
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    testReminders: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  sessions: [sessionSchema],
  lastPasswordChange: Date,
  accountDeletionRequested: { type: Boolean, default: false },
  deletionRequestDate: Date,
  deletionConfirmationToken: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otp: String,
  otpExpires: Date,
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOTP: String,
  emailVerificationOTPExpires: Date,
  tempUserData: {
    fullName: String,
    email: String,
    password: String,
    photo: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
