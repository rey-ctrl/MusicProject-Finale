// Import fungsi yang dibutuhkan dan dipakai
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getDatabase, set, get, update, remove, push, ref as databaseRef, child, onValue, orderByChild } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCd4gAut32iu7lQ0YLVK1xzJN25y37mK4g",
    authDomain: "musicproject-427316.firebaseapp.com",
    projectId: "musicproject-427316",
    storageBucket: "musicproject-427316.appspot.com",
    messagingSenderId: "77259916396",
    appId: "1:77259916396:web:0ff55b24897302c6ee8449",
    measurementId: "G-Q7NN2YRB4S"
};

// Menginisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Menginisialisasi Authentication
const auth = getAuth(app);

// Menginisialisasi Storage
const storage = getStorage(app);

// Menginisialisasi Database
const db = getDatabase();

// PROSES MEMBUAT AKUN (SIGN UP)
document.addEventListener("DOMContentLoaded", () => {
    // Menginisialisasi variabel untuk menarik data dari inputan
    const adminEmailForSignUp = document.querySelector("#admin-create-email");
    const adminPasswordForSignUp = document.querySelector("#admin-create-password");

    // Variabel untuk tombol signup
    const signUpBtn = document.querySelector("#signup-account-btn");

    // Membuat fungsi signup
    const userSignUp = async () => {
        // Mengambil nilai dari inputan dan memasukkannya ke variabel baru
        const signUpEmail = adminEmailForSignUp.value;
        const signUpPassword = adminPasswordForSignUp.value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
            const user = userCredential.user;
            alert("Account successfully created");
            window.location.reload();  // Refresh halaman setelah akun berhasil dibuat
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode + errorMessage);
            alert("Error creating account: " + errorMessage);  // Menampilkan pesan error yang lebih informatif
        }
    };

    // Menjalankan fungsi userSignUp ketika tombol create account ditekan
    signUpBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Mencegah halaman untuk reload atau action default lainnya
        userSignUp();
    });
});

// PROSES MASUK AKUN (LOGIN)
document.addEventListener("DOMContentLoaded", () => {
    // Menginisialisasi variabel untuk menarik data dari inputan
    const adminEmailForLogin = document.querySelector("#admin-login-email");
    const adminPasswordForLogin = document.querySelector("#admin-login-password");

    // Variabel untuk tombol login
    const loginBtn = document.querySelector("#login-account-btn");

    // Membuat fungsi sign in
    const userSignIn = async () => {
        // Mengambil nilai dari inputan dan memasukkannya ke variabel baru
        const loginEmail = adminEmailForLogin.value;
        const loginPassword = adminPasswordForLogin.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            const user = userCredential.user;
            alert("Account successfully logged in");
            window.location.href = "/src/main/resources/templates/pages/login/artist-page/artist.html";
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode + errorMessage);
            alert("Error logging in: " + errorMessage);
        }
    }

    // Menjalankan fungsi userSignIn ketika tombol login ditekan
    loginBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Mencegah halaman untuk reload atau action default lainnya
        userSignIn();
    });
});

// PROSES MEMBUAT biography
document.addEventListener("DOMContentLoaded", () => {
    // Mendapatkan elemen input
    const artistTitleInput = document.querySelector("#artist-title");
    const artistCategoryInput = document.querySelector("#artist-category");
    const artistBiographyInput = document.querySelector("#artist-biography");
    const artistImageInput = document.querySelector("#artist-image");

    // Tombol submit
    const createArtistBtn = document.querySelector("#create-artist-btn");

    // Inisialisasi fungsi untuk membuat card
    const createArtist = async () => {
        // Mendapatkan file gambar yang diunggah
        const imageFile = artistImageInput.files[0];

        // Jika input tidak terisi maka tampilkan pesan error 
        if (!imageFile || !artistTitleInput.value || !artistCategoryInput.value || !artistBiographyInput.value) {
            alert("Please fill out all fields");
            return;
        }

        // Upload gambar ke Firebase Storage
        const storageReference = storageRef(storage, `Images/${imageFile.name}`);
        await uploadBytes(storageReference, imageFile);

        // Mendapatkan URL gambar yang diunggah
        const imageURL = await getDownloadURL(storageReference);

        // Menyimpan data resep ke Firebase Realtime Database
        await set(push(databaseRef(db, "Artists")), {
            ArtistTitle: artistTitleInput.value,
            ArtistCategory: artistCategoryInput.value,
            ArtistBiography: artistBiographyInput.value,
            ArtistImage: imageURL, // Menyimpan URL gambar
            CreatedAt: new Date().toISOString()
        })
            .then(() => {
                // Menampilkan pesan sukses
                alert("Artist created successfully!");
                window.location.reload();
            })
            .catch((error) => {
                // Menampilkan pesan error
                alert("Error creating biography: " + error);
            });
    };

    // Menjalankan fungsi createArtist ketika tombol create artist ditekan
    createArtistBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Mencegah halaman untuk reload atau action default lainnya
        createArtist();
    });
});

// PROSES MENAMPILKAN RESEP DI HALAMAN RESEP DETAIL
document.addEventListener("DOMContentLoaded", () => {

    // Membuat fungsi untuk mendapatkan query dari URL
    function getQueryParam(param) {
        // Menyimpan URL saat ini ke dalam variabel
        const urlParams = new URLSearchParams(window.location.search);

        // Memberikan value dari function getQueryParam menjadi URL yang sedang dibuka
        return urlParams.get(param);
    }

    // Menapatkan referensi UID Resep yang sedang dibuka dari URL
    const uid = getQueryParam("uid");

    // Pengkondisian untuk menampilkan resep yang sedang dibuka berdasarkan UID nya
    if (uid) {
        // Mendapatkan referensi resep berdasarkan UID di dalam tabel Artist
        const artistRef = databaseRef(db, `Artists/${uid}`);

        // Fungsi bawaan Firebase untuk mendapatkan data
        get(artistRef).then((snapshot) => {
            // Pengkondisian untuk menampilkan resep jika UID yang diinginkan ada di tabel
            if (snapshot.exists()) {
                const artistData = snapshot.val();

                document.getElementById("artist-image").src = artistData.ArtistImage;
                document.getElementById("artist-title").innerText = artistData.ArtistTitle;
                document.getElementById("artist-category").innerText = artistData.ArtistCategory;
                document.getElementById("artist-biography").innerText = artistData.ArtistBiography;

                // Mendapatkan elemen Edit This Artist di navbar
                const editArtistLink = document.querySelector("#edit-artist");

                // Merubah href dari tag di navbar menjadi URL yang diinginkan
                if (editArtistLink) {
                    editArtistLink.href = `/src/main/resources/templates/pages/login/edit-artist-form/index.html?uid=${uid}`;
                }
            } else {
                console.log("No data available for this biography");
            }
        }).catch((error) => {
            console.log("Error getting data: " + error);
        });
    } else {
        console.log("No UID available for this biography");
    }
});

// PROSES MENAMPILKAN RESEP DI HALAMAN SEARCH
document.addEventListener("DOMContentLoaded", () => {
    // Mendapatkan referensi tabel yang diinginkan dari database
    const artistRef = databaseRef(db, "Artists");

    // Mendapatkan elemen HTML yang akan dimanipulasi
    const displayArtistContainer = document.querySelector("#display-artist");

    // Mendapatkan data resep untuk ditampilkan di halaman search resep
    onValue(artistRef, (snapshot) => {
        // Mendapatkan data resep
        const data = snapshot.val();

        // Menghapus konten yang ada (untuk mencegah duplikasi)
        displayArtistContainer.innerHTML = "";

        // Melakukan iterasi setiap entri di dalam data 
        for (const uid in data) {
            const artistData = data[uid];

            const artistCard = document.createElement("div");
            artistCard.className = `itemBox ${artistData.toLowerCase()} flex justify-center text-center py - 2`;

            // Menampilkan elemen HTML
            artistCard.innerHTML = `
        <a href = "/src/main/resources/templates/pages/login/artist-detail/index.html?uid=${uid}" class= "block w-80">
        <div
            class="card-artist bg-white border border-gray-50 rounded-md hover:scale-105 transition-transform duration-500">
            <img class="custom-image w-full h-56 object-cover rounded-t-md"
                src="${artistData.ArtistImage}"
                alt="${artistData.ArtistTitle}" />
            <div class="p-4 font-sans">
                <!-- Menggunakan break-words untuk membungkus teks panjang -->
                <h1 class="text-lg font-bold text-gray-800 break-words">${artistData.ArtistTitle}</h1>
                <div class="flex flex-col mt-4">
                    <button
                        class="border border-green-600 text-green-600 hover:bg-green-600 hover:underline text-sm font-semibold rounded-lg px-4 py-2 transition-colors duration-300">
                        See Artist
                    </button>
                </div>
            </div>
        </div>
        </a>
            `;

            // Menambahkan elemen HTML ke dalam div parents
            displayArtistContainer.appendChild(artistCard);
        }
    }, (errorObject) => {
        console.log("Error getting data: " + errorObject.code);
    });
});

// PROSES MENAMPILKAN DATA RESEP SAAT INI UNTUK DIGANTI DI HALAMAN EDIT RESEP
document.addEventListener("DOMContentLoaded", () => {
    // Membuat fungsi untuk mendapatkan query dari URL
    function getQueryParam(param) {
        // Menyimpan URL saat ini ke dalam variabel
        const urlParams = new URLSearchParams(window.location.search);

        // Memberikan value dari function getQueryParam menjadi URL yang sedang dibuka
        return urlParams.get(param);
    }

    // Mendapatkan UID dari URL
    const uid = getQueryParam("uid");

    // Membuat variabel untuk mendapatkan bagian input dari HTML
    const displayCurrentArtistImage = document.querySelector("#display-artist-image");
    const artistUIDInput = document.querySelector("#artist-uid");
    const artistTitleInput = document.querySelector("#artist-title-input");
    const artistCategoryInput = document.querySelector("#artist-category-input");
    const artistBiographyInput = document.querySelector("#artist-biography-input");
    const artistTipsInput = document.querySelector("#artist-tips-input");
    const viewArtistButton = document.querySelector("#view-artist");

    // Variabel untuk mendapatkan bagian input gambar artist
    const artistImageInput = document.querySelector("#artist-image");

    // Membuat variabel untuk mendapatkan tombol update resep dan tombol delete resep
    const updateArtistButton = document.querySelector("#update-artist-btn");
    const deleteArtistButton = document.querySelector("#delete-artist-btn");

    // Pengkondisian untuk menampilkan resep yang sedang dibuka berdasarkan UID nya
    if (uid) {
        // Mendapatkan referensi resep berdasarkan UID di dalam tabel Artist
        const artistRef = databaseRef(db, `Artists/${uid}`);

        // Fungsi bawaan Firebase untuk mendapatkan data
        get(artistRef).then((snapshot) => {
            // Pengkondisian untuk menampilkan resep jika UID yang diinginkan ada di tabel
            if (snapshot.exists()) {
                // Mengambil data resep dari database
                const Data = snapshot.val();

                displayCurrentArtistImage.src = artistData.ArtistImage;
                viewArtistButton.href = `/src/main/resources/templates/pages/login/artist-detail/index.html?uid=${uid}`;

                artistUIDInput.value = uid;
                artistTitleInput.value = artistData.Title;
                artistCategoryInput.value = artistData.ArtistCategory;
                artistBiographyInput.value = artistData.ArtistBiography;
                artistTipsInput.value = artistData.artistTips;
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.log("Error getting data: ", error);
        });
    } else {
        console.log("No UID provided");
    }

    function updateArtist() {
        // Mendapatkan file gambar yang diunggah, jika ada
        const imageFile = artistImageInput.files[0];

        // Membuat referensi ke data biography di Firebase
        const artistRef = databaseRef(db, `Artists/${artistUIDInput.value}`);

        // Fungsi untuk mengupdate data di database
        function updateArtistData(imageURL) {
            update(artistRef, {
                ArtistTitle: artistTitleInput.value,
                ArtistBiography: artistBiographyInput.value,
                ArtistImage: imageURL || displayCurrentArtistImage.src // Gunakan URL baru atau URL yang sudah ada
            }).then(() => {
                alert("Biography updated successfully!");
            }).catch((error) => {
                console.error("Error updating Biography: ", error);
            });
        }

        // Jika ada gambar baru, unggah ke Firebase Storage
        if (imageFile) {
            const storageImageRef = storageRef(storage, `Images/${imageFile.name}`);
            uploadBytes(storageImageRef, imageFile).then(() => {
                return getDownloadURL(storageImageRef);
            }).then((imageURL) => {
                updateArtistData(imageURL);
            }).catch((error) => {
                console.error("Error uploading image: ", error);
            });
        } else {
            // Jika tidak ada gambar baru, langsung perbarui data
            updateAtistData();
        }
    }

    // Menambahkan event listener ke tombol update
    updateArtistButton.addEventListener("click", (event) => {
        event.preventDefault();
        updateArtist();
    });

    // Fungsi untuk menghapus biography
    function deleteArtist() {
        // Ambil referensi ke data resep yang akan dihapus
        const artistRef = databaseRef(db, "Artists/" + artistUIDInput.value);

        // Ambil data resep terlebih dahulu untuk mendapatkan URL gambar
        get(artistRef).then((snapshot) => {
            if (snapshot.exists()) {
                const artistData = snapshot.val();
                const imageURL = artistData.ArtistImage;

                // Hapus data resep dari database
                remove(artistRef).then(() => {
                    alert("Artist deleted successfully!");

                    // Jika gambar ada, hapus dari Firebase Storage
                    if (imageURL) {
                        // Ekstrak nama file dari URL gambar
                        const imageName = decodeURIComponent(imageURL.split('/o/')[1].split('?')[0]);

                        // Referensi ke gambar di Firebase Storage
                        const storageImageRef = storageRef(storage, imageName);

                        // Hapus gambar dari Firebase Storage
                        deleteObject(storageImageRef).then(() => {
                            console.log("Image deleted successfully from storage.");
                        }).catch((error) => {
                            console.error("Error deleting image from storage: ", error);
                        });
                    }
                }).catch((error) => {
                    console.error("Error deleting Biography: ", error);
                    alert("Failed to delete Biography. Please try again.");
                });
            } else {
                console.log("No data available for the given UID.");
                alert("Biography not found. Please check the UID.");
            }
        }).catch((error) => {
            console.error("Error retrieving Biography: ", error);
        });
    }

    // Tambahkan event listener ke tombol delete
    deleteArtistButton.addEventListener("click", (event) => {
        event.preventDefault();
        const confirmDelete = confirm("Are you sure you want to delete this Biography?");
        if (confirmDelete) {
            deleteArtist();
        }
    });
})


// NAVBAR STARTS
var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

// Change the icons inside the button based on previous settings
if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    themeToggleLightIcon.classList.remove('hidden');
} else {
    themeToggleDarkIcon.classList.remove('hidden');
}

var themeToggleBtn = document.getElementById('theme-toggle');

themeToggleBtn.addEventListener('click', function() {

    // toggle icons inside button
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    // if set via local storage previously
    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }

    // if NOT set via local storage previously
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }
    
});
// NAVBAR ENDS


