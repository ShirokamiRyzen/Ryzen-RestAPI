







//


    tag_battery_status = document.querySelector('small#battery_status');
    tag_battery_level = document.querySelector('span#battery_level');
   


//Baterry
     setInterval(function() {
         navigator.getBattery().then(battery=> {
             battery_level = String(battery.level).split('.')[1];
             tag_battery_level.innerHTML = `${(battery_level.length <= 1)? oud(Number(battery_level)): battery_level}% ${battery.charging ? 'charging': 'discharging'}`;
         });
     },
         10);

//Visit
/*
$.getJSON("https://api.countapi.xyz/hit/api.ryzendesu.com/visitor", function(response) {
    $("#visitor").text(response.value);
})
*/
// Fungsi untuk mengatur cookie
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Fungsi untuk mendapatkan nilai cookie
function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

// Fungsi untuk menambahkan pengunjung dan menampilkan jumlah total
function updateVisitorCount() {
    const visitorCount = parseInt(getCookie("visitorCount")) || 0;
    const newVisitorCount = visitorCount + 1;
    setCookie("visitorCount", newVisitorCount.toString(), 365);
    document.getElementById("visitor").textContent = newVisitorCount.toString();
}

// Panggil fungsi saat halaman dimuat
updateVisitorCount();




//Jam
let scrollToTopRoundedfasfauserninjaXfa2xtextprimary=document.querySelector('div#row-no-guttersalign-items-center');let fasfauserninjaXfa2xtextprimary=document.querySelector('div#text-xsfont-weight-boldtext-uppercase-mb-1');setInterval(()=>{var widthdeVicewidthXinitialscalesHrinkno=new Date();const Jam= widthdeVicewidthXinitialscalesHrinkno.getHours().toString().padStart(2,0);const jam= widthdeVicewidthXinitialscalesHrinkno.getHours().toString().padStart(2,0);const menit= widthdeVicewidthXinitialscalesHrinkno.getMinutes().toString().padStart(2,0);const Menit = widthdeVicewidthXinitialscalesHrinkno.getMinutes().toString().padStart(2,0);const Detik = widthdeVicewidthXinitialscalesHrinkno.getSeconds().toString().padStart(2,0);const detik= widthdeVicewidthXinitialscalesHrinkno.getSeconds().toString().padStart(2,0);const jaM= widthdeVicewidthXinitialscalesHrinkno.getHours().toString().padStart(2,0);const mEnit= widthdeVicewidthXinitialscalesHrinkno.getMinutes().toString().padStart(2,0);const detIk= widthdeVicewidthXinitialscalesHrinkno.getSeconds().toString().padStart(2,0);scrollToTopRoundedfasfauserninjaXfa2xtextprimary.innerHTML=jaM+":"+mEnit+":"+detIk},250);