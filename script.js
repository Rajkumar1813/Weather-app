const API_KEY = '85548261cbb59d0320841f4bf8d95789';

const getWeatherData=(city)=>{
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`).then(res => {
        if(res.status === 200){
            return res.json()
        }
        else{
            alert("Please Enter a valid City Name")
        }
    }).then(data=>{
        console.log(data);
        showWeatherData(data);
    })
}
getWeatherData("Delhi");

document.getElementById('city_name').innerHTML = "Kashipur";

function showWeatherData(data){
    let {humidity, pressure, temp, temp_max, temp_min, feels_like}= data.main;
    let {sunrise, sunset} = data.sys;
    let {deg, speed} = data.wind;

    document.getElementById('temp').innerHTML=temp;
    document.getElementById('min_temp').innerHTML=temp_max;
    document.getElementById('max_temp').innerHTML=temp_min;
    document.getElementById('humidity').innerHTML=humidity;
    document.getElementById('pressure').innerHTML=pressure;
    document.getElementById('feels_like').innerHTML=feels_like;
    document.getElementById('sunrise').innerHTML=timeformat(sunrise);
    document.getElementById('sunset').innerHTML=timeformat(sunset);
    document.getElementById('wind_degree').innerHTML=degToCompass(deg);
    document.getElementById('wind_speed').innerHTML=speed;

    function timeformat(timestamp){
        var datetime = new Date(timestamp * 1000);  
        return datetime.toLocaleTimeString();
    }
    function degToCompass(num) {
        var val = Math.floor((num / 22.5) + 0.5);
        var arr = ["N", "N-NE", "NE", "E-NE", "E", "E-SE", "SE", "S-SE", "S", "S-SW", "SW", "W-SW", "W", "W-NW", "NW", "N-NW"];
        return arr[(val % 16)];
    }
}


document.getElementById('search').addEventListener('click',(e)=>{
    e.preventDefault()
    if(city.value == ""){
        alert("Please Enter a City Name !")
    }
    else{
        document.getElementById('city_name').innerHTML=city.value;
        getWeatherData(city.value)
    }
})

document.getElementById('greet').innerHTML=greeting();

function greeting(){
    let date=new Date()
    let hours= date.getHours()
    if(hours>=0 && hours<12)
    return "Good Morning"
    else if(hours>=12 && hours<16)
    return "Good Afternoon"
    else
    return "Good Evening"
}

// let date = new Date()
// let hours = date.getHours()

// if (hours>=0 && hours<12) {
//     greetings.innerHTML="Good Morning"
    
// } else if (hours>=12 && hours<16) {
//     greetings.innerHTML="Good Afternoon"
// } else {
//     greetings.innerHTML="Good Evening"
// }