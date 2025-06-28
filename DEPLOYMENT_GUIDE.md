# 🚀 Puppeteer Premium Export Deployment Guide

This guide shows how to deploy the server-side premium export system using Supabase Edge Functions with Puppeteer.

## 📋 Prerequisites

1. **Supabase CLI installed**:
   ```bash
   npm install -g supabase
   ```

2. **Supabase project** with authentication enabled

3. **Database tables** for user subscriptions (if not already created)

## 🏗️ Setup Steps

### 1. Initialize Supabase in Your Project

```bash
# Navigate to your project directory
cd "AI Tool Risk Framework App"

# Link to your existing Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Or initialize a new project (if needed)
supabase init
```

### 2. Create User Subscriptions Table (if needed)

```sql
-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);
```

### 3. Deploy the Edge Function

```bash
# Deploy the premium PDF generation function
supabase functions deploy generate-premium-pdf

# Alternatively, deploy all functions
supabase functions deploy
```

### 4. Set Environment Variables

The Edge Function automatically has access to:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Your anon/public key

## 🧪 Testing the Deployment

### Test Authentication

1. Sign up for an account in your app
2. Set user tier to 'enterprise' in your database:
   ```sql
   UPDATE auth.users 
   SET user_metadata = jsonb_set(user_metadata, '{tier}', '"enterprise"')
   WHERE email = 'test@example.com';
   ```

### Test Premium Export

1. Complete an assessment
2. Click "Premium PDF Export" 
3. Should generate server-side PDF with Puppeteer

## 🔍 Monitoring & Debugging

### View Function Logs

```bash
# Real-time logs
supabase functions logs --function generate-premium-pdf

# Or view in Supabase Dashboard > Edge Functions
```

### Common Issues

**1. Authentication Errors**
- Ensure user is signed in
- Check JWT token validity
- Verify user tier in database

**2. Puppeteer Timeout**
- Large assessments may take longer
- Increase timeout in config.toml if needed

**3. Memory Issues**
- Puppeteer can be memory-intensive
- Consider upgrading Supabase plan if needed

## 🏷️ Architecture Benefits

### ✅ Advantages of Server-Side Generation

- **Perfect Fidelity**: Puppeteer renders exactly like a browser
- **Consistent Output**: No browser differences or client-side issues  
- **Premium Justification**: Server resources justify pricing
- **Security**: Assessment data never leaves secure environment
- **Scalability**: Dedicated server resources

### 📊 Performance Comparison

| Method | Quality | Consistency | Performance | Premium Value |
|--------|---------|-------------|-------------|---------------|
| Client Print | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Puppeteer Server | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 Next Steps

1. **Test thoroughly** with different assessment types
2. **Monitor performance** and adjust timeout if needed
3. **Add custom branding** to premium templates
4. **Implement payment integration** for automatic tier upgrades
5. **Create user dashboard** for managing subscriptions

## 💰 Pricing Strategy

- **Free**: Basic client-side PDF (current page print)
- **Enterprise ($49/month)**: Server-generated Puppeteer PDFs
  - Perfect fidelity
  - Professional formatting
  - Audit-ready reports
  - Compliance documentation

This creates clear value differentiation while keeping the free tier functional! 