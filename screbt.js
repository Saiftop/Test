/* ================= اختيار الباقة ================= */
function selectPack(robux) {
    localStorage.setItem("selectedRobux", robux);
    document.getElementById("packCards").style.display = "none";
    document.getElementById("orderForm").style.display = "block";
    showPackInfo();
}

/* ================= عرض الباقة المختارة ================= */
function showPackInfo() {
    const robux = localStorage.getItem("selectedRobux");
    const coins = (robux / 140) * 55;
    if (robux) {
        document.getElementById("packInfo").innerText =
            `الباقة المختارة: ${robux} Robux = ${coins} Coins`;
    }
}

/* ================= إرسال الطلب ================= */
function sendOrder() {
    const robux = localStorage.getItem("selectedRobux");
    const username = document.getElementById("username").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const msg = document.getElementById("msg");

    if (!robux || !username || !contact) {
        msg.style.color = "red";
        msg.innerText = "❌ يرجى ملء جميع الحقول";
        return;
    }

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders.push({
        robux: robux,
        coins: (robux / 140) * 55,
        username: username,
        contact: contact,
        status: "Pending",
        date: new Date().toLocaleString()
    });

    localStorage.setItem("orders", JSON.stringify(orders));

    msg.style.color = "lightgreen";
    msg.innerText = "✅ تم إرسال الطلب بنجاح";

    document.getElementById("username").value = "";
    document.getElementById("contact").value = "";
}

/* ================= زر الأدمن الصغير ================= */
document.getElementById("adminBtn").onclick = function() {
    const panel = document.getElementById("adminPanel");
    if(panel.classList.contains("hidden")){
        panel.classList.remove("hidden");
    } else {
        panel.classList.add("hidden");
    }
};

/* ================= تسجيل دخول الأدمن ================= */
function loginAdmin() {
    const pass = document.getElementById("adminPass").value;
    if(pass === "MOAZ109") {
        document.getElementById("adminArea").classList.remove("hidden");
        updateDashboard();
    } else {
        alert("كلمة المرور خاطئة");
    }
}

/* ================= تسجيل خروج الأدمن ================= */
function logoutAdmin() {
    document.getElementById("adminArea").classList.add("hidden");
    document.getElementById("adminPass").value = "";
    document.getElementById("adminPanel").classList.add("hidden");
}

/* ================= تحديث لوحة الأدمن ================= */
function updateDashboard() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const tbody = document.getElementById("ordersBody");
    const stats = document.getElementById("stats");

    tbody.innerHTML = "";
    let totalRobux = 0, totalCoins = 0;

    orders.forEach((o,i)=>{
        totalRobux += Number(o.robux);
        totalCoins += Number(o.coins);

        tbody.innerHTML += `
        <tr>
            <td>${i+1}</td>
            <td>${o.username}</td>
            <td>${o.robux}</td>
            <td>${o.coins}</td>
            <td>${o.contact}</td>
            <td>
                <select onchange="changeStatus(${i}, this.value)">
                    <option value="Pending" ${o.status==="Pending"?"selected":""}>Pending</option>
                    <option value="Done" ${o.status==="Done"?"selected":""}>Done</option>
                </select>
            </td>
            <td>${o.date}</td>
            <td><button onclick="deleteOrder(${i})">حذف</button></td>
        </tr>`;
    });

    stats.innerHTML = `<b>إحصائيات:</b> الطلبات: ${orders.length} | مجموع Robux: ${totalRobux} | مجموع Coins: ${totalCoins}`;
}

/* ================= تغيير حالة الطلب ================= */
function changeStatus(i,val){
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    if(orders[i]){
        orders[i].status=val;
        localStorage.setItem("orders",JSON.stringify(orders));
        updateDashboard();
    }
}

/* ================= حذف طلب ================= */
function deleteOrder(i){
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    if(confirm("هل أنت متأكد من حذف هذا الطلب؟")){
        orders.splice(i,1);
        localStorage.setItem("orders",JSON.stringify(orders));
        updateDashboard();
    }
}
