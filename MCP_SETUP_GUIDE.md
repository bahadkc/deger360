# Supabase MCP Setup Guide for Cursor IDE

This guide will help you set up Supabase MCP (Model Context Protocol) so that I can directly access and query your Supabase database.

## 📋 Step-by-Step Instructions

### Step 1: Generate Supabase Personal Access Token

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Log in to your account

2. **Navigate to Access Tokens**
   - Click on your **profile icon** (top right)
   - Go to **"Account Settings"** or **"Access Tokens"**
   - Or go directly to: https://supabase.com/dashboard/account/tokens

3. **Create New Token**
   - Click **"Generate New Token"** or **"Create Token"**
   - Name it: `Cursor MCP Server` (or any name you prefer)
   - Click **"Generate Token"**
   - **⚠️ IMPORTANT:** Copy the token immediately - you won't be able to see it again!

### Step 2: Update MCP Configuration File

1. **Open the MCP configuration file**
   - File location: `.cursor/mcp.json` (already created in your project)

2. **Replace the placeholder token**
   - Find: `YOUR_SUPABASE_ACCESS_TOKEN_HERE`
   - Replace it with your actual Supabase Personal Access Token

   The file should look like this:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--access-token",
           "sbp_your_actual_token_here_1234567890abcdef"
         ]
       }
     }
   }
   ```

### Step 3: Restart Cursor IDE

1. **Close Cursor completely**
   - Make sure all Cursor windows are closed

2. **Reopen Cursor**
   - Open Cursor IDE again
   - Open your project

3. **Verify MCP Connection**
   - Go to **Settings** → **Cursor Settings** → **MCP & Integrations**
   - You should see "supabase" listed with an active/green status
   - If you see an error, check that the token is correct

### Step 4: Test the Connection

Once configured, I'll be able to:
- ✅ Query your database schema
- ✅ Read table structures and relationships
- ✅ Execute SQL queries
- ✅ View data from all tables
- ✅ Suggest database operations

## 🔍 Alternative: Check MCP Status

You can verify the setup by:
1. Opening Cursor Settings (`Ctrl+,` or `Cmd+,`)
2. Searching for "MCP"
3. Looking for "MCP Servers" section
4. Verifying "supabase" appears in the list

## 🛠️ Troubleshooting

### Issue: MCP server not showing up
- **Solution:** Make sure `.cursor/mcp.json` is in your project root
- **Solution:** Restart Cursor completely
- **Solution:** Check that the JSON syntax is correct (no trailing commas)

### Issue: Connection error
- **Solution:** Verify your Personal Access Token is correct
- **Solution:** Make sure the token hasn't expired
- **Solution:** Generate a new token and update the config file

### Issue: Can't find Access Tokens page
- **Solution:** Go to: https://supabase.com/dashboard/account/tokens
- **Solution:** Or click your profile → Account Settings → Access Tokens

## 📝 What I Can Do Once Connected

Once MCP is set up, I can:
- Query your database directly: `SELECT * FROM customers LIMIT 10`
- Show table schemas: `DESCRIBE cases`
- Analyze relationships between tables
- Suggest SQL queries based on your schema
- Help optimize database queries
- Debug database issues

## 🔐 Security Notes

- ✅ The Personal Access Token is stored locally in `.cursor/mcp.json`
- ✅ This file should NOT be committed to git (already in `.gitignore`)
- ✅ The token gives read/write access to your Supabase project
- ✅ You can revoke the token anytime from Supabase dashboard

## ✅ Next Steps

After completing these steps:
1. Restart Cursor
2. Let me know when it's done
3. I'll test the connection and show you what I can access!

---

**Need Help?** If you encounter any issues, share the error message and I'll help troubleshoot!
