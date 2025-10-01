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

# Razorpay Configuration
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET="your-s3-bucket-name"

# Email Configuration (for OTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Server Configuration
PORT=3000
NODE_ENV="development"
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

## PostgreSQL vs MySQL Differences

- **Auto-increment**: Uses `SERIAL` instead of `AUTO_INCREMENT`
- **Data Types**: Uses PostgreSQL native types (TEXT, INTEGER, DECIMAL, etc.)
- **Enums**: Uses PostgreSQL ENUM types
- **Constraints**: Uses PostgreSQL constraint syntax

## Troubleshooting

If you encounter issues:

1. **Reset the database**: `npx prisma migrate reset`
2. **Regenerate Prisma client**: `npx prisma generate`
3. **Check connection**: Verify your DATABASE_URL is correct
4. **Check PostgreSQL is running**: Ensure PostgreSQL service is active
