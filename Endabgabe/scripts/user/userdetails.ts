namespace Twitter {
    let url: string = "http://localhost:8100";
    // let url: string = "https://gis2020jw.herokuapp.com";

    let htmlName: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("name");
    let htmlEmail: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("email");
    let htmlStudyDetails: HTMLParagraphElement = <HTMLParagraphElement>document.getElementById("studyDetails");
    let htmlFollowerSec: HTMLDivElement = <HTMLDivElement>document.getElementById("followerSec");
    let htmlFollowingSec: HTMLDivElement = <HTMLDivElement>document.getElementById("followingSec");
    let htmlProfPicSec: HTMLDivElement = <HTMLDivElement>document.getElementById("profPicSec");
    let htmlTweetSec: HTMLDivElement = <HTMLDivElement>document.getElementById("tweetSec");

    let query: URLSearchParams = new URLSearchParams(window.location.search);
    if (query.has("email")) {
        showUserDetail(query.get("email"));
    } else {
        //TODO weiterleitung auf alle Benutzer Seite
        console.log("No email Param given");
    }

    interface User {
        _id: string;
        firstname: string;
        lastname: string;
        studycourse: string;
        semester: string;
        email: string;
        pictureLink?: string;
        followers: string[];
        following: string[];
    }

    interface Tweet {
        text: string;
        creationDate: Date;
        media?: string;
        userName: string;
        userEmail: string;
        userPicture?: string;
    }

    interface ResponseFromServer {
        status: number;
        message: string;
        authCookieString?: string;
        data?: string[];
        tweets?: Tweet[];
        users?: User[];
    }

    async function showUserDetail(email: string): Promise<void> {
        console.log("Get User Details for Email: " + email);
        let params: URLSearchParams = new URLSearchParams();
        let authKey: string = getAuthCode();
        if (authKey.length > 0) {
            params.append("authKey", authKey);
            params.append("command", "showUserDetail");
            params.append("email", email);
            let response: Response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: params
            });
            let responseFromServer: ResponseFromServer = await response.json();
            if (responseFromServer.status >= 0) {
                if (responseFromServer.users && responseFromServer.users.length > 0) {
                    let user: User = responseFromServer.users[0];
                    if (user.pictureLink) {
                        let htmlProfilePic: HTMLImageElement = document.createElement("img");
                        //TODO styling
                        htmlProfilePic.src = user.pictureLink;
                        htmlProfPicSec.appendChild(htmlProfilePic);
                    }
                    htmlName.textContent = user.firstname + " " + user.lastname;
                    htmlEmail.textContent = user.email;
                    htmlStudyDetails.textContent = "Studiengang: " + user.studycourse + ", Semester: " + user.semester;
                    //TODO durch Links ersetzen
                    let htmlFollower: HTMLParagraphElement = document.createElement("p");
                    htmlFollower.textContent = "Follower: " + user.followers.length.toString();
                    htmlFollowerSec.appendChild(htmlFollower);
                    let htmlFollowing: HTMLParagraphElement = document.createElement("p");
                    htmlFollowing.textContent = "Following: " + user.following.length.toString();
                    htmlFollowerSec.appendChild(htmlFollowing);
                    if (responseFromServer.tweets) {
                        if (responseFromServer.tweets.length > 0) {
                            for (let index: number = 0; index < responseFromServer.tweets.length; index++) {
                                const tweet: Tweet = responseFromServer.tweets[index];
                                let tweetDiv: HTMLDivElement = createTweetElement(tweet);
                                htmlTweetSec.appendChild(tweetDiv);
                            }
                        }
                    }
                } else {
                    console.log("Error no User returned");
                }
            } else {
                console.log("Error: " + responseFromServer.message);
                //TODO
            }
        } else {
            //TODO weiterleitung
            console.log("Need to login again");
        }

    }

    function createTweetElement(tweet: Tweet): HTMLDivElement {
        let element: HTMLDivElement = document.createElement("div");
        //TODO styling
        let htmlUserName: HTMLParagraphElement = document.createElement("p");
        htmlUserName.textContent = tweet.userName;
        let htmlUserEmail: HTMLParagraphElement = document.createElement("p");
        htmlUserEmail.textContent = tweet.userEmail;
        let htmlUserImg: HTMLImageElement;
        if (tweet.userPicture) {
            htmlUserImg = document.createElement("img");
            htmlUserImg.src = tweet.userPicture;
        }
        let htmlText: HTMLParagraphElement = document.createElement("p");
        htmlText.textContent = tweet.text;
        let htmlCreationDate: HTMLParagraphElement = document.createElement("p");
        htmlCreationDate.textContent = new Date(tweet.creationDate).toString();

        element.appendChild(htmlUserName);
        element.appendChild(htmlUserEmail);
        if (tweet.userPicture) {
            element.appendChild(htmlUserImg);
        }
        element.appendChild(htmlText);
        element.appendChild(htmlCreationDate);

        //TODO media
        return element;
    }
}