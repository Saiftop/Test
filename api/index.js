const mongoose = require('mongoose');

// اللينك بتاعك بعد ما حطيت فيه الباسورد اللي بعته
const MONGO_URI = "mongodb+srv://Saif0754:Saif*1234@cluster0.uig6kv3.mongodb.net/SevoStore?retryWrites=true&w=majority";

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB Connection Error: ", err);
    }
};

const CodeSchema = new mongoose.Schema({
    type: String,
    code: String,
    isSold: { type: Boolean, default: false },
    orderId: String,
    dateSold: Date
});
const Code = mongoose.models.Code || mongoose.model('Code', CodeSchema);

const ADMIN_PASSWORD = "Saif*1234";

module.exports = async (req, res) => {
    await connectDB();
    const { method, body } = req;

    if (method === 'POST') {
        // إضافة كود للمخزن (لوحة الأدمن)
        if (body.action === 'add') {
            if (body.pass !== ADMIN_PASSWORD) return res.json({ success: false, msg: "الباسورد غلط" });
            await Code.create({ type: body.type, code: body.code });
            return res.json({ success: true, msg: "الكود نزل في المخزن ✅" });
        }
        
        // عملية الشراء
        if (body.action === 'buy') {
            const stock = await Code.findOne({ type: body.type, isSold: false });
            if (!stock) return res.json({ success: false, msg: "للأسف خلصنا، اطلب من الأدمن يوفر تاني" });
            
            const orderId = "SV-" + Math.random().toString(36).substr(2, 6).toUpperCase();
            // هنا بنحولك لصفحة النجاح (دفع وهمي حالياً)
            return res.json({ success: true, url: `?page=success&orderId=${orderId}&type=${body.type}` });
        }

        // استلام الكود بعد الدفع
        if (body.action === 'claim') {
            let item = await Code.findOneAndUpdate(
                { type: body.type, isSold: false },
                { isSold: true, orderId: body.orderId, dateSold: new Date() },
                { new: true }
            );
            return res.json({ success: !!item, code: item ? item.code : "الكود متباع أو مش موجود" });
        }
    }

    // --- واجهة الموقع (التصميم بتاعك sevo.html) ---
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sevo store - شحن تلقائي</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        :root { --Saif-color: #FFD700; --Saif-dark-bg: #121212; --Saif-card-bg-dark: #1e1e1e; --Saif-yalla-purple: #5c009d; --Saif-text-light: #ffffff; }
        body { font-family: 'Cairo', sans-serif; background: var(--Saif-dark-bg); color: #fff; margin: 0; padding: 0; text-align: center; }
        header { background: linear-gradient(45deg, #000, var(--Saif-yalla-purple)); padding: 40px 20px; border-bottom: 3px solid var(--Saif-color); }
        .container { max-width: 800px; margin: auto; padding: 20px; }
        .card { background: var(--Saif-card-bg-dark); border-radius: 20px; padding: 30px; margin: 20px 0; border: 1px solid #333; transition: 0.3s; }
        .card:hover { border-color: var(--Saif-color); transform: translateY(-5px); }
        .btn-buy { background: var(--Saif-yalla-purple); color: #fff; border: 2px solid var(--Saif-text-light); padding: 15px; border-radius: 50px; font-weight: bold; width: 100%; cursor: pointer; font-size: 1.1rem; }
        .price { color: var(--Saif-color); font-size: 1.5rem; font-weight: 900; margin: 10px 0; }
        #adminArea { display: none; background: #000; border: 2px solid var(--Saif-color); padding: 25px; border-radius: 20px; margin-top: 40px; }
        input, select { width: 100%; padding: 12px; margin: 10px 0; background: #222; border: 1px solid #444; color: #fff; border-radius: 10px; }
    </style>
</head>
<body>
    <header>
        <h1 style="font-size: 2.5rem; margin:0;">SEVO <span style="color:var(--Saif-color)">STORE</span></h1>
        <p>متجر شحن شدات ببجي - تسليم فوري</p>
    </header>

    <div class="container">
        <div id="successView" style="display:none;">
            <div class="card">
                <i class="fas fa-check-circle" style="font-size: 60px; color: var(--Saif-color); margin-bottom: 20px;"></i>
                <h2>تم الدفع بنجاح!</h2>
                <p>كود الشحن الخاص بك هو:</p>
                <div id="displayCode" style="font-size: 28px; color: var(--Saif-color); border: 2px dashed #fff; padding: 20px; margin: 20px 0;">جاري السحب...</div>
                <button class="btn-buy" onclick="location.href='/'">العودة للمتجر</button>
            </div>
        </div>

        <div id="storeView">
            <div class="card">
                <h3>60 UC</h3>
                <div class="price">0.89 USD</div>
                <button class="btn-buy" onclick="handleBuy('60UC')">شراء الآن</button>
            </div>
            <div class="card">
                <h3>325 UC</h3>
                <div class="price">4.49 USD</div>
                <button class="btn-buy" onclick="handleBuy('325UC')">شراء الآن</button>
            </div>
            <p style="opacity:0.1; cursor:pointer; margin-top:50px;" onclick="openAdmin()">الإدارة 🔐</p>
        </div>

        <div id="adminArea">
            <h3 style="color:var(--Saif-color)">لوحة تحكم الأكواد</h3>
            <input type="password" id="adminPass" placeholder="كلمة السر">
            <select id="pType"><option value="60UC">60 UC</option><option value="325UC">325 UC</option></select>
            <input type="text" id="pCode" placeholder="ضع الكود هنا">
            <button class="btn-buy" style="background:#2ed573" onclick="addCode()">إضافة للمخزن</button>
        </div>
    </div>

    <script>
        const params = new URLSearchParams(window.location.search);
        if(params.get('page') === 'success') {
            document.getElementById('storeView').style.display = 'none';
            document.getElementById('successView').style.display = 'block';
            fetch('/api', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ action: 'claim', orderId: params.get('orderId'), type: params.get('type') })
            }).then(r => r.json()).then(d => {
                document.getElementById('displayCode').innerText = d.success ? d.code : "انتهى المخزن!";
            });
        }

        async function handleBuy(type) {
            const res = await fetch('/api', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ action: 'buy', type })
            });
            const data = await res.json();
            if(data.success) window.location.href = data.url;
            else alert(data.msg);
        }

        function openAdmin() {
            const p = prompt("باسورد الأدمن:");
            if(p === "${ADMIN_PASSWORD}") {
                document.getElementById('adminArea').style.display = 'block';
                document.getElementById('adminPass').value = p;
            }
        }

        async function addCode() {
            const res = await fetch('/api', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    action: 'add',
                    pass: document.getElementById('adminPass').value,
                    type: document.getElementById('pType').value,
                    code: document.getElementById('pCode').value
                })
            });
            const data = await res.json();
            alert(data.msg);
            document.getElementById('pCode').value = '';
        }
    </script>
</body>
</html>
    `);
};
