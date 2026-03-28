# 🚀 Development & Deployment Workflow Guide

## ⚠️ IMPORTANT: Database Strategy

**NEVER use the same database for development and production!**

### Database Setup:

```
Development Database (Local):  localhost:5432/radiatorstockdb_dev
Production Database (Server):  143.198.198.90:5432/radiatorstockdb
```

---

## 📝 Development Phase

### 1. **Backend Development (C# .NET)**

#### Start Local Backend:
```bash
cd MyBusinessBackend-main
dotnet run
```

#### Test Backend Locally:
```bash
# Backend will run on: http://localhost:5128
# Test API health:
curl http://localhost:5128/health
```

#### Watch for Changes (Auto-reload):
```bash
cd MyBusinessBackend-main
dotnet watch run
```

---

### 2. **Frontend Development (React)**

#### Start Local Frontend:
```bash
cd Frontend-radiator-main
npm run dev
```

#### Frontend will run on:
```
http://localhost:5173
```

#### Test Frontend:
- Open browser: http://localhost:5173
- Frontend will connect to: http://localhost:5128 (local backend)

---

### 3. **Database Management During Development**

#### Create Local Development Database:
```bash
# Connect to local PostgreSQL
psql -U postgres

# Create dev database
CREATE DATABASE radiatorstockdb_dev;
```

#### Update Local appsettings:
```json
// MyBusinessBackend-main/appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=radiatorstockdb_dev;Username=postgres;Password=your_local_password;Port=5432;SSL Mode=Disable"
  }
}
```

#### Run Migrations on Dev Database:
```bash
cd MyBusinessBackend-main
dotnet ef database update
```

---

## ✅ Testing Phase

### Run All Tests:
```bash
# Backend tests (if you have them)
cd MyBusinessBackend-main
dotnet test

# Frontend tests (if you have them)
cd Frontend-radiator-main
npm test
```

### Manual Testing Checklist:
- [ ] Test all CRUD operations
- [ ] Test image uploads
- [ ] Test filters and search
- [ ] Test product type categories
- [ ] Test authentication
- [ ] Check console for errors

---

## 🚀 Deployment Phase (After Testing Successfully)

### **Step 1: Build Backend**
```bash
cd MyBusinessBackend-main
dotnet publish -c Release -o publish
```

### **Step 2: Build Frontend**
```bash
cd Frontend-radiator-main
npm run build
```

### **Step 3: Deploy Backend to Production**
```bash
# From project root
rsync -avz -e "ssh -i ~/.ssh/radiator-stock-keypair" --delete MyBusinessBackend-main/publish/ root@143.198.198.90:/var/www/radiatorstock/

# Restart backend service
ssh -i ~/.ssh/radiator-stock-keypair root@143.198.198.90 'systemctl restart radiatorstock'
```

### **Step 4: Deploy Frontend to Production**
```bash
# From Frontend-radiator-main directory
rsync -avz -e "ssh -i ~/.ssh/radiator-stock-keypair" --delete dist/ root@143.198.198.90:/var/www/radiatorstock-frontend/
```

### **Step 5: Verify Deployment**
```bash
# Check backend health
curl http://143.198.198.90/health

# Check frontend
open http://143.198.198.90
```

---

## 📊 Complete Workflow Summary

### Development Workflow:
```bash
# 1. Start Development
cd MyBusinessBackend-main && dotnet watch run          # Terminal 1
cd Frontend-radiator-main && npm run dev               # Terminal 2

# 2. Make changes to code
# 3. Test locally at http://localhost:5173
# 4. Check for errors in both terminals

# 5. When satisfied, commit changes
git add .
git commit -m "Your changes"
git push
```

### Deployment Workflow:
```bash
# 1. Build both projects
cd MyBusinessBackend-main && dotnet publish -c Release -o publish
cd ../Frontend-radiator-main && npm run build

# 2. Deploy backend
rsync -avz -e "ssh -i ~/.ssh/radiator-stock-keypair" --delete MyBusinessBackend-main/publish/ root@143.198.198.90:/var/www/radiatorstock/
ssh -i ~/.ssh/radiator-stock-keypair root@143.198.198.90 'systemctl restart radiatorstock'

# 3. Deploy frontend
rsync -avz -e "ssh -i ~/.ssh/radiator-stock-keypair" --delete Frontend-radiator-main/dist/ root@143.198.198.90:/var/www/radiatorstock-frontend/

# 4. Verify
curl http://143.198.198.90/health
```

---

## 🔧 Quick Commands Reference

### Development:
| Task | Command |
|------|---------|
| Start Backend | `cd MyBusinessBackend-main && dotnet run` |
| Start Frontend | `cd Frontend-radiator-main && npm run dev` |
| Watch Backend | `cd MyBusinessBackend-main && dotnet watch run` |
| Install Frontend Deps | `cd Frontend-radiator-main && npm install` |

### Build:
| Task | Command |
|------|---------|
| Build Backend | `cd MyBusinessBackend-main && dotnet publish -c Release -o publish` |
| Build Frontend | `cd Frontend-radiator-main && npm run build` |
| Clean Backend | `cd MyBusinessBackend-main && dotnet clean` |

### Deploy:
| Task | Command |
|------|---------|
| Deploy Backend | `rsync -avz -e "ssh -i ~/.ssh/radiator-stock-keypair" --delete MyBusinessBackend-main/publish/ root@143.198.198.90:/var/www/radiatorstock/` |
| Deploy Frontend | `rsync -avz -e "ssh -i ~/.ssh/radiator-stock-keypair" --delete Frontend-radiator-main/dist/ root@143.198.198.90:/var/www/radiatorstock-frontend/` |
| Restart Backend | `ssh -i ~/.ssh/radiator-stock-keypair root@143.198.198.90 'systemctl restart radiatorstock'` |

### Database:
| Task | Command |
|------|---------|
| Create Migration | `cd MyBusinessBackend-main && dotnet ef migrations add MigrationName` |
| Update Dev DB | `cd MyBusinessBackend-main && dotnet ef database update` |
| Drop Dev DB | `cd MyBusinessBackend-main && dotnet ef database drop` |

---

## 🎯 Best Practices

### DO:
✅ Always test locally first
✅ Use separate dev and prod databases
✅ Commit changes before deploying
✅ Check health endpoint after deployment
✅ Keep .env files out of git
✅ Back up production database regularly

### DON'T:
❌ Test on production database
❌ Deploy without building first
❌ Commit sensitive credentials
❌ Skip testing phase
❌ Deploy on Friday evening 😅

---

## 🆘 Troubleshooting

### Backend won't start:
```bash
# Check if port 5128 is in use
lsof -i :5128
# Kill process if needed
kill -9 <PID>
```

### Frontend won't connect to backend:
- Check backend is running: `curl http://localhost:5128/health`
- Check CORS settings in backend
- Check API URL in frontend .env

### Deployment fails:
```bash
# Check SSH connection
ssh -i ~/.ssh/radiator-stock-keypair root@143.198.198.90 'ls -la /var/www/'

# Check service status
ssh -i ~/.ssh/radiator-stock-keypair root@143.198.198.90 'systemctl status radiatorstock'

# Check logs
ssh -i ~/.ssh/radiator-stock-keypair root@143.198.198.90 'journalctl -u radiatorstock -n 50'
```

---

## 📞 Need Help?

If something goes wrong:
1. Check terminal errors
2. Check browser console (F12)
3. Check backend logs
4. Ask Claude! 🤖
