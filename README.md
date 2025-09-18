For the website to work you need to run in the terminal:
1. This website can only run if you have these dependencies installed on VSCODE
> cors
> dotenv
> express
> mongoDB
> mongoose
> 

so you would need to install them in your local machine or your IDE to continue.

2. The website is just a prototype, it doesnt work at all with private networks like campus and company websites that dont allow access to MONGODB. Make sure your network allows access or use a VPN.


cd Leaf-Line/backend (then press Enter)
npm run devStart (then press Enter)
You should see a message saying to know if it is working:

✅ Loaded MONGO_URI from .env
🔍 Connecting to MongoDB Atlas...
📡 Connection string (hidden password): mongodb+srv://group4:****@hackathon-cluster.0x8dphs.mongodb.net/?retryWrites=true&w=majority&appName=Hackathon-Cluster
✅ MongoDB connected successfully (Atlas)
🚀 Server running on http://localhost:5000
