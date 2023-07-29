let cropper;
let currentImageIndex = 0;
let imagesToCrop = [];
let croppedImages = [];

function previewsImages(event) {
    let input = event.target;
    let previewContainer = document.getElementById("previewContainer");
    previewContainer.innerHTML = ""; // Clear previous previews

    let files = input.files;
    for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        let file = files[i];

        reader.onload = function () {
            let dataURL = reader.result;
            let previewImage = new Image();
            previewImage.src = dataURL;
            previewImage.style.maxWidth = "200px";
            previewContainer.appendChild(previewImage);

            // Store the image for cropping
            imagesToCrop.push(dataURL);

            if (i === 0) {
                startCropper();
            }
        };

        reader.readAsDataURL(file);
    }
}

function startCropper() {
    if (imagesToCrop.length === 0 || currentImageIndex >= imagesToCrop.length) {
        alert("All images cropped.");
        return;
    }

    // Clear previous cropper instance
    if (cropper) {
        cropper.destroy();
    }

    // Create new cropper instance for the next image
    let previewImage = document.getElementById("previewContainer").getElementsByTagName("img")[currentImageIndex];
    cropper = new Cropper(previewImage, {
        aspectRatio: 1, // You can adjust the aspect ratio as needed
        viewMode: 2, // Set to 2 for restriction-free cropping
        guides: true,
        movable: true,
        zoomable: true,
        rotatable: true,
        cropBoxResizable: true,
    });
}

function cropNextImage() {
    if (!cropper) {
        alert("Please upload images first.");
        return;
    }

    let croppedCanvas = cropper.getCroppedCanvas();
    let croppedImage = croppedCanvas.toDataURL("image/jpeg");

    // Store the cropped image in the array
    croppedImages.push(croppedImage);

    // Increment to the next image or reset if all images are cropped
    currentImageIndex++;
    if (currentImageIndex < imagesToCrop.length) {
        startCropper();
    } else {
        alert("All images cropped.");
        updateCroppedPreview();
        resetCrop();
    }
}

function updateCroppedPreview() {
    // Display the cropped images below the button
    let croppedImageContainer = document.getElementById("croppedImageContainer");
    croppedImageContainer.innerHTML = "";

    for (let i = 0; i < croppedImages.length; i++) {
        let croppedImageElement = new Image();
        croppedImageElement.src = croppedImages[i];
        croppedImageElement.style.maxWidth = "200px"; // Adjust the width as needed
        croppedImageContainer.appendChild(croppedImageElement);
    }
}

function resetCrop() {
    currentImageIndex = 0;
    imagesToCrop = [];
    croppedImages = [];
    let croppedImageContainer = document.getElementById("croppedImageContainer");
    croppedImageContainer.innerHTML = "";

    // Clear the cropper instance
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}
