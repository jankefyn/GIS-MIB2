namespace Twitter {
    // export let url: string = "http://localhost:8100";
    export let url: string = "https://gis2020jw.herokuapp.com";

    let KEYLASTLOCATION: string = "lastLocation";

    export interface RequestToServerInterface {
        [type: string]: string;
    }

    export interface ResponseFromServer {
        status: number;
        message: string;
        authCookieString?: string;
        data?: string[];
        tweets?: Tweet[];
        users?: User[];
    }

    export interface User {
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

    export interface Tweet {
        _id?: string;
        text: string;
        creationDate: Date;
        media?: string;
        userName: string;
        userEmail: string;
        userPicture?: string;
    }

    export async function postToServer(requestData: RequestToServerInterface): Promise<ResponseFromServer> {
        let params: URLSearchParams = new URLSearchParams();
        let authKey: string = getAuthCode();
        if (authKey.length > 0) {
            params.append("authKey", authKey);
            Object.keys(requestData).forEach((key: string) => {
                params.append(key, requestData[key]);
            });
            let response: Response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: params
            });
            let responseFromServer: ResponseFromServer = await response.json();
            return responseFromServer;
        } else {
            console.log("Need to Login again");
            redirectToLogin();
        }
        return null;
    }
    export async function postToServerWithoutAuth(requestData: RequestToServerInterface): Promise<ResponseFromServer> {
        let params: URLSearchParams = new URLSearchParams();
        Object.keys(requestData).forEach((key: string) => {
            params.append(key, requestData[key]);
        });
        let response: Response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: params
        });
        let responseFromServer: ResponseFromServer = await response.json();
        return responseFromServer;
    }

    export function redirectToLogin(): void {
        let actLoc: string = window.location.href;
        sessionStorage.setItem(KEYLASTLOCATION, actLoc);
        window.location.replace("login.html");
    }

    export function redirectToLastLocation(): void {
        let lastLoc: string = sessionStorage.getItem(KEYLASTLOCATION);
        if (lastLoc) {
            if (lastLoc.length > 0) {
                window.location.replace(lastLoc);
                return;
            }
        }
        let authCode: string = getAuthCode();
        if (authCode != null && authCode.length > 0) {
            window.location.replace("tweet.html");
        } else {
            sessionStorage.removeItem(KEYLASTLOCATION);
            window.location.replace("login.html");
        }
    }

    export function saveAuthCookie(authCookieString: string): void {
        document.cookie = authCookieString + "; path=/; SameSite=Lax";
        console.log("Saved");
        redirectToLastLocation();
    }

    export function getAuthCode(): string {
        return getCookie("Authorization");
    }

    //######Code from https://www.w3schools.com/js/js_cookies.asp ######################
    export function deleteAuthCookie(shouldRedirect: boolean): void {
        document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (shouldRedirect) {
            redirectToLogin();
        }
    }

    //######Code from https://www.w3schools.com/js/js_cookies.asp ######################
    function getCookie(cname: string): string {
        let name: string = cname + "=";
        let decodedCookie: string = decodeURIComponent(document.cookie);
        let ca: string[] = decodedCookie.split(";");
        for (let i: number = 0; i < ca.length; i++) {
            let c: string = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    export function createTweetElement(tweet: Tweet): HTMLDivElement {
        let element: HTMLDivElement = document.createElement("div");
        //TODO styling
        let htmlUserName: HTMLAnchorElement = document.createElement("a");
        htmlUserName.textContent = tweet.userName;
        if (tweet.userName != "Admin") {
            htmlUserName.href = "userdetails.html?email=" + tweet.userEmail;
        }
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
        htmlCreationDate.textContent = new Date(tweet.creationDate).toDateString();

        element.appendChild(htmlUserName);
        element.appendChild(htmlUserEmail);
        if (tweet.userPicture) {
            element.appendChild(htmlUserImg);
        }
        element.appendChild(htmlText);
        element.appendChild(htmlCreationDate);

        if (sessionStorage.getItem("email") == tweet.userEmail) {
            let btDelete: HTMLButtonElement = document.createElement("button");
            btDelete.textContent = "Delete";
            btDelete.addEventListener("click", async function (): Promise<void> {
                await deleteTweet(tweet._id);
                window.location.reload();
            });
            htmlUserName.href = "userdetails.html";
            element.appendChild(btDelete);
            //TODO Edit
        }


        //TODO media
        return element;
    }

    async function deleteTweet(id: string): Promise<void | boolean> {
        //TODO
        let request: RequestToServerInterface = { command: "deleteTweet", tweetID: id };
        let answer: ResponseFromServer = await postToServer(request);
        if (answer != null) {
            if (answer.status) {
                // let status: number = <number>answer.status;
                let message: string = <string>answer.message;
                console.log(message);
            }
        } else {
            console.log("Something went wrong, maybe need to login again");
        }
    }
}