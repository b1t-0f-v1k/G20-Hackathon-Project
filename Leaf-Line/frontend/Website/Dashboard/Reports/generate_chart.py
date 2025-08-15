import sys
import io
import base64
import pymongo
import matplotlib.pyplot as plt
from bson.objectid import ObjectId
import os

# ✅ Check if Business ID was passed
if len(sys.argv) < 2:
    print("Business ID is required", file=sys.stderr)
    sys.exit(1)

business_id = sys.argv[1]

# ✅ MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority")
client = pymongo.MongoClient(MONGO_URI)
db = client.get_database()  # Uses DB from connection string
collection = db["smeemissions"]  # Replace with your actual collection name

# ✅ Fetch data for given Business ID
data = list(collection.find({"businessID": business_id}))

if not data:
    print(f"No data found for Business ID: {business_id}", file=sys.stderr)
    sys.exit(1)

# ✅ Example: Assuming each doc has "month" and "emissions" fields
months = [doc.get("month", "N/A") for doc in data]
emissions = [doc.get("emissions", 0) for doc in data]

# ✅ Create plot
plt.figure(figsize=(8, 5))
plt.plot(months, emissions, marker="o", color="green")
plt.title(f"Emissions for Business ID: {business_id}")
plt.xlabel("Month")
plt.ylabel("Emissions")
plt.grid(True)

# ✅ Save to buffer and print to stdout
buf = io.BytesIO()
plt.savefig(buf, format="png")
plt.close()
buf.seek(0)
sys.stdout.buffer.write(buf.read())
