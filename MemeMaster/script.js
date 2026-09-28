// ======================================================
// MEME COURT - SCRIPT.JS
// OCR + MEME ANALYSIS + EVIDENCE STATUS
// ======================================================


// ======================================================
// START COURT
// ======================================================

function startCourt() {

    const intro = document.getElementById("intro");
    const app = document.getElementById("app");

    intro.style.display = "none";
    app.classList.remove("hidden");

}


// ======================================================
// IMAGE UPLOAD + OCR
// ======================================================

async function handleImageUpload(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }


    const message =
        document.getElementById("uploadMessage");

    const preview =
        document.getElementById("imagePreview");

    const previewImg =
        document.getElementById("previewImg");


    // --------------------------------------------------
    // CHECK FILE
    // --------------------------------------------------

    if (!file.type.startsWith("image/")) {

        message.innerText =
            "⚠️ Please upload an image file.";

        return;
    }


    // --------------------------------------------------
    // SHOW IMAGE PREVIEW
    // --------------------------------------------------

    const imageURL =
        URL.createObjectURL(file);

    previewImg.src = imageURL;

    preview.classList.remove("hidden");


    message.innerText =
        "🔍 Reading the meme...";


    // --------------------------------------------------
    // OCR
    // --------------------------------------------------

    try {

        const result = await Tesseract.recognize(
            file,
            "eng",
            {

                logger: function(info) {

                    if (
                        info.status ===
                        "recognizing text"
                    ) {

                        const percentage =
                            Math.round(
                                info.progress * 100
                            );

                        message.innerText =
                            "🧠 Reading meme text... " +
                            percentage +
                            "%";

                    }

                }

            }
        );


        // --------------------------------------------------
        // GET EXTRACTED TEXT
        // --------------------------------------------------

        const extractedText =
            result.data.text.trim();


        const textArea =
            document.getElementById("memeText");


        // --------------------------------------------------
        // PUT OCR TEXT INTO TEXTAREA
        // --------------------------------------------------

        textArea.value =
            extractedText;


        // --------------------------------------------------
        // OCR RESULT
        // --------------------------------------------------

        if (extractedText.length > 0) {

            message.innerText =
                "✅ Meme text detected! " +
                "You can analyze it now. ⚖️";

        } else {

            message.innerText =
                "⚠️ No text detected. " +
                "Try a clearer meme image.";

        }


    } catch (error) {

        console.error(
            "OCR Error:",
            error
        );

        message.innerText =
            "❌ Couldn't read this image. " +
            "Try another image.";

    }

}


// ======================================================
// ANALYZE MEME
// ======================================================

async function analyzeMeme() {

    const memeText =
        document
            .getElementById("memeText")
            .value
            .trim();


    // --------------------------------------------------
    // EMPTY CHECK
    // --------------------------------------------------

    if (memeText === "") {

        alert(
            "⚖️ COURT RULE:\n\n" +
            "Upload a meme or enter meme text first! 😂"
        );

        return;

    }


    // --------------------------------------------------
    // HIDE INPUT
    // --------------------------------------------------

    document
        .querySelector(".input-card")
        .classList.add("hidden");


    document
        .querySelector(".title-area")
        .classList.add("hidden");


    // --------------------------------------------------
    // SHOW LOADING
    // --------------------------------------------------

    const loading =
        document.getElementById("loading");

    loading.classList.remove("hidden");


    const loadingText =
        document.getElementById("loadingText");


    const progress =
        document.getElementById("progress");


    // --------------------------------------------------
    // LOADING MESSAGES
    // --------------------------------------------------

    const messages = [

        "🕵️ Interrogating the meme...",

        "🔍 Extracting the suspicious claim...",

        "📚 Examining the evidence...",

        "🤨 Checking suspicious wording...",

        "🧠 Running MemeMeter analysis...",

        "💀 The meme is getting nervous...",

        "⚖️ Preparing the verdict..."

    ];


    let index = 0;


    const messageInterval =
        setInterval(() => {

            loadingText.innerText =
                messages[index];

            index++;


            if (index >= messages.length) {

                index = 0;

            }

        }, 700);


    // --------------------------------------------------
    // PROGRESS BAR
    // --------------------------------------------------

    let width = 0;


    const progressInterval =
        setInterval(() => {

            width += 2;


            if (width > 95) {

                width = 95;

            }


            progress.style.width =
                width + "%";

        }, 100);


    // --------------------------------------------------
    // SEND DATA TO FLASK
    // --------------------------------------------------

    try {

        const response =
            await fetch(
                "/analyze",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        meme_text:
                            memeText

                    })

                }
            );


        const data =
            await response.json();


        // --------------------------------------------------
        // STOP ANIMATIONS
        // --------------------------------------------------

        clearInterval(
            messageInterval
        );

        clearInterval(
            progressInterval
        );


        progress.style.width =
            "100%";


        // --------------------------------------------------
        // CHECK ERROR
        // --------------------------------------------------

        if (
            !response.ok ||
            data.error
        ) {

            throw new Error(
                data.error ||
                "Something went wrong."
            );

        }


        // --------------------------------------------------
        // SHOW RESULT
        // --------------------------------------------------

        setTimeout(() => {

            loading.classList.add(
                "hidden"
            );


            showResult(data);

        }, 400);


    } catch (error) {

        clearInterval(
            messageInterval
        );

        clearInterval(
            progressInterval
        );


        loading.classList.add(
            "hidden"
        );


        document
            .querySelector(".input-card")
            .classList.remove("hidden");


        document
            .querySelector(".title-area")
            .classList.remove("hidden");


        alert(
            "⚠️ Meme Court encountered an error:\n\n" +
            error.message
        );


        console.error(
            "Analysis Error:",
            error
        );

    }

}


// ======================================================
// SHOW RESULT
// ======================================================

function showResult(data) {

    const result =
        document.getElementById("result");


    result.classList.remove(
        "hidden"
    );


    // ==================================================
    // CLAIM
    // ==================================================

    const claim =
        document.getElementById("claim");


    claim.innerText =
        data.claim ||
        "No clear factual claim detected.";


    // ==================================================
    // ACCURACY
    // ==================================================

    const accuracy =
        Number(
            data.accuracy_score
        ) || 0;


    document
        .getElementById("accuracy")
        .innerText =
        accuracy + "%";


    document
        .getElementById("accuracyBar")
        .style.width =
        "0%";


    // Small delay creates animation effect

    setTimeout(() => {

        document
            .getElementById("accuracyBar")
            .style.width =
            accuracy + "%";

    }, 100);


    // ==================================================
    // MISINFORMATION RISK
    // ==================================================

    const risk =
        Number(
            data.misinformation_risk
        ) || 0;


    document
        .getElementById("risk")
        .innerText =
        risk + "%";


    document
        .getElementById("riskBar")
        .style.width =
        "0%";


    setTimeout(() => {

        document
            .getElementById("riskBar")
            .style.width =
            risk + "%";

    }, 100);


    // ==================================================
    // FACT CHECK STATUS
    // ==================================================

    const factCheck =
        document.getElementById(
            "factCheck"
        );


    if (
        data.fact_check_required
    ) {

        factCheck.innerText =
            "YES ⚠️";

    } else {

        factCheck.innerText =
            "NO ✅";

    }


    // ==================================================
    // VERDICT
    // ==================================================

    document
        .getElementById("verdict")
        .innerText =
        data.verdict ||
        "UNCERTAIN";


    // ==================================================
    // VERDICT MESSAGE
    // ==================================================

    let verdictMessage = "";


    if (
        data.content_type ===
        "humor/joke"
    ) {

        verdictMessage =
            "The court found this to be mainly humor. " +
            "No serious factual claim was detected. 😂";


    } else if (
        data.content_type ===
        "opinion"
    ) {

        verdictMessage =
            "This appears to express an opinion " +
            "rather than a directly verifiable fact. " +
            "Opinions aren't automatically misinformation. 🤔";


    } else if (
        risk >= 70
    ) {

        verdictMessage =
            "This claim has a high misinformation risk " +
            "and should be checked before sharing. 🚨";


    } else if (
        risk >= 40
    ) {

        verdictMessage =
            "This claim deserves further investigation " +
            "before you trust or share it. 🧐";


    } else {

        verdictMessage =
            "The claim appears relatively low-risk, " +
            "but evidence and context still matter. 👍";

    }


    document
        .getElementById(
            "verdictMessage"
        )
        .innerText =
        verdictMessage;


    // ==================================================
    // EXPLANATION
    // ==================================================

    document
        .getElementById(
            "explanation"
        )
        .innerText =
        data.reason ||
        "No explanation available.";


    // ==================================================
    // VERIFICATION POINTS
    // ==================================================

    const verification =
        document.getElementById(
            "verification"
        );


    verification.innerHTML =
        "";


    if (
        data.verification_points &&
        Array.isArray(
            data.verification_points
        )
    ) {

        data.verification_points.forEach(
            function(point) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.innerText =
                    point;


                verification.appendChild(
                    li
                );

            }
        );

    } else {

        verification.innerHTML = `

            <li>
                Find the original source of the claim.
            </li>

            <li>
                Check reliable independent sources.
            </li>

            <li>
                Verify dates, numbers and statistics.
            </li>

            <li>
                Check whether important context is missing.
            </li>

        `;

    }


    // ==================================================
    // EVIDENCE STATUS
    // ==================================================

    const evidenceStatus =
        document.getElementById(
            "evidenceStatus"
        );


    const evidenceNote =
        document.getElementById(
            "evidenceNote"
        );


    // These elements exist in the new index.html.
    // The checks prevent errors if an older HTML
    // version is still open.

    if (
        evidenceStatus &&
        evidenceNote
    ) {


        if (
            data.fact_check_required
        ) {

            evidenceStatus.innerText =
                "⚠️ VERIFICATION REQUIRED";


            evidenceNote.innerText =
                "This claim has been flagged " +
                "for verification. The current " +
                "MVP has not independently confirmed " +
                "the claim against external sources.";


        } else {


            evidenceStatus.innerText =
                "✅ NO FACTUAL CLAIM DETECTED";


            evidenceNote.innerText =
                "The submitted content appears " +
                "to be primarily humor or opinion " +
                "rather than a directly verifiable " +
                "factual claim.";

        }

    }


    // ==================================================
    // FINAL FUN MESSAGE
    // ==================================================

    const finalMessage =
        document.getElementById(
            "finalMessage"
        );


    if (
        risk >= 70
    ) {

        finalMessage.innerText =
            "⚖️ Verdict: Bro... " +
            "we REALLY need the receipts. 🧾💀";


    } else if (
        risk >= 40
    ) {

        finalMessage.innerText =
            "⚖️ Verdict: Suspicious behaviour detected. " +
            "Keep investigating. 🕵️";


    } else {

        finalMessage.innerText =
            "⚖️ Verdict: The meme survives... " +
            "for now. 😂";

    }


    // ==================================================
    // SCROLL TO RESULT
    // ==================================================

    result.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


// ======================================================
// NEW CASE
// ======================================================

function newCase() {

    // --------------------------------------------------
    // HIDE RESULT
    // --------------------------------------------------

    document
        .getElementById("result")
        .classList.add(
            "hidden"
        );


    // --------------------------------------------------
    // SHOW INPUT
    // --------------------------------------------------

    document
        .querySelector(".input-card")
        .classList.remove(
            "hidden"
        );


    document
        .querySelector(".title-area")
        .classList.remove(
            "hidden"
        );


    // --------------------------------------------------
    // CLEAR TEXT
    // --------------------------------------------------

    document
        .getElementById("memeText")
        .value =
        "";


    // --------------------------------------------------
    // CLEAR UPLOAD MESSAGE
    // --------------------------------------------------

    const uploadMessage =
        document.getElementById(
            "uploadMessage"
        );


    if (uploadMessage) {

        uploadMessage.innerText =
            "";

    }


    // --------------------------------------------------
    // HIDE IMAGE PREVIEW
    // --------------------------------------------------

    const imagePreview =
        document.getElementById(
            "imagePreview"
        );


    if (imagePreview) {

        imagePreview.classList.add(
            "hidden"
        );

    }


    // --------------------------------------------------
    // CLEAR IMAGE
    // --------------------------------------------------

    const memeImage =
        document.getElementById(
            "memeImage"
        );


    if (memeImage) {

        memeImage.value =
            "";

    }


    // --------------------------------------------------
    // RESET PROGRESS
    // --------------------------------------------------

    const progress =
        document.getElementById(
            "progress"
        );


    if (progress) {

        progress.style.width =
            "0%";

    }


    // --------------------------------------------------
    // RESET LOADING TEXT
    // --------------------------------------------------

    const loadingText =
        document.getElementById(
            "loadingText"
        );


    if (loadingText) {

        loadingText.innerText =
            "Interrogating the meme...";

    }


    // --------------------------------------------------
    // SCROLL TO TOP
    // --------------------------------------------------

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================================
// END OF SCRIPT
// ======================================================