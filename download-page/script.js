const features = [
    {
        image: "assets/screenshot-1.png",
        title: "Virtual Pet Companion",
        desc: "Interact with Ginger, your virtual cat companion through simple actions and animations."
    },
    {
        image: "assets/screenshot-2.png",
        title: "Interactive Calendar",
        desc: "A built-in calendar that displays the current date and allows users to set a personal birthday."
    },
    {
        image: "assets/screenshot-3.png",
        title: "Birthday Celebration",
        desc: "Special birthday mode with unique visuals, messages, and a surprise gift when your birthday arrives."
    }
];

let currentIndex = 0;

const img = document.getElementById("feature-image");
const title = document.getElementById("feature-title");
const desc = document.getElementById("feature-desc");

function updateFeature(index) {
    img.src = features[index].image;
    title.textContent = features[index].title;
    desc.textContent = features[index].desc;
}

document.getElementById("next-btn").onclick = () => {
    currentIndex = (currentIndex + 1) % features.length;
    updateFeature(currentIndex);
};

document.getElementById("prev-btn").onclick = () => {
    currentIndex = (currentIndex - 1 + features.length) % features.length;
    updateFeature(currentIndex);
};
