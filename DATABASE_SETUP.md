# Database Setup - PostgreSQL Migration

This project has been migrated from MySQL to PostgreSQL. Follow these steps to set up your database:

## Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# Database Configuration
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL="postgresql://username:password@localhost:5432/sassyshringaar"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key-here"
OTP_SECRET="your-otp-secret-key-here"

# Email Configuration (REQUIRED for OTP verification)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Razorpay Configuration (Optional)
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET="your-s3-bucket-name"

# Server Configuration
PORT=3000
NODE_ENV="development"
```

## Email Configuration Setup

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

### Other Email Providers

- **Outlook/Hotmail**: Use `smtp-mail.outlook.com` with port `587`
- **Yahoo**: Use `smtp.mail.yahoo.com` with port `587`
- **Custom SMTP**: Configure according to your provider's settings

### Environment Variables for Email

```env
SMTP_HOST="smtp.gmail.com"          # Your SMTP server
SMTP_PORT="587"                      # Port (587 for TLS, 465 for SSL)
SMTP_USER="your-email@gmail.com"    # Your email address
SMTP_PASS="your-app-password"        # App password or regular password
```

## Database Setup Steps

1. **Install PostgreSQL** on your system
2. **Create a database** named `sassyshringaar` (or update the DATABASE_URL accordingly)
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run migrations**:
   ```bash
   npx prisma migrate dev
   ```
5. **Seed the database**:
   ```bash
   npx prisma db seed
   ```

## Key Changes Made

- **Provider**: Changed from `mysql` to `postgresql` in `prisma/schema.prisma`
- **Data Types**: Removed MySQL-specific data type annotations (`@db.VarChar`, `@db.UnsignedInt`, etc.)
- **Dependencies**: Added `pg` and `@types/pg` packages
- **Migration**: Created new PostgreSQL migration replacing the old MySQL one
- **Email Verification**: Implemented proper OTP email sending with nodemailer
- **Configuration Validation**: Added startup validation for all required environment variables

## PostgreSQL vs MySQL Differences

- **Auto-increment**: Uses `SERIAL` instead of `AUTO_INCREMENT`
- **Data Types**: Uses PostgreSQL native types (TEXT, INTEGER, DECIMAL, etc.)
- **Enums**: Uses PostgreSQL ENUM types
- **Constraints**: Uses PostgreSQL constraint syntax

## Email Verification System

The application now includes a robust email verification system:

- **Random OTP Generation**: 4-digit random OTPs (no more hardcoded 1234)
- **Email Templates**: Professional HTML email templates with branding
- **Error Handling**: Graceful handling of email sending failures
- **Configuration Validation**: Startup validation ensures all email settings are correct
- **Security**: OTPs expire after 5 minutes and are cryptographically hashed

## Troubleshooting

### Email Issues

- **"Email service temporarily unavailable"**: Check your SMTP credentials
- **"Missing required environment variables"**: Ensure all SMTP\_\* variables are set
- **Authentication failed**: Verify your email and app password are correct

### Database Issues

- **Connection refused**: Ensure PostgreSQL is running and accessible
- **Authentication failed**: Check your DATABASE_URL credentials
- **Database doesn't exist**: Create the database before running migrations

### General Issues

- **Server won't start**: Check the console for configuration validation errors
- **OTP not working**: Ensure OTP_SECRET is set and email service is configured

If you encounter issues:

1. **Reset the database**: `npx prisma migrate reset`
2. **Regenerate Prisma client**: `npx prisma generate`
3. **Check connection**: Verify your DATABASE_URL is correct
4. **Check PostgreSQL is running**: Ensure PostgreSQL service is active
