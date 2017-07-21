(function() {
    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }

    function remove(a, obj) {
        var i = a.indexOf(obj);
        if (i > 0) {
            a.splice(i, 1);
        }
    }

    function init() {
	chrome.storage.sync.get("hn_banned", function(value) {
	    var users = value.hn_banned;
            if (value.hn_banned === undefined) {
                users = [];
            }

	    function banUser(username) {
		users.push(username);
		chrome.storage.sync.set({"hn_banned": users});
	    }

	    function unbanUser(username) {
                remove(users, username);
		chrome.storage.sync.set({"hn_banned": users});
	    }

	    function listener(changes, namespace) {
		chrome.storage.onChanged.removeListener(listener);
		init();
	    }

	    chrome.storage.onChanged.addListener(listener);

	    function handleItem(item) {
		var username = item.querySelector("a").text;
		var contents = item.querySelector(".comment span");

		var seperator = item.querySelector(".hn_bl_seperator");

		if (seperator !== null) {
		    seperator.remove();
		    seperator = null;
		}

		seperator = document.createElement("span");
		seperator.innerHTML = " | ";
		seperator.className = "hn_bl_seperator";

		var actor = document.createElement('a');
		actor.href = "#";

		item.querySelector(".comhead").appendChild(seperator);
		seperator.appendChild(actor);

		var blockedMessage = item.querySelector(".blocked");

		if (blockedMessage !== null) {
		    blockedMessage.remove();
		}

		if (contains(users, username)) {
		    contents.style.display = "none";

		    actor.innerHTML = "unblock";
		    actor.onclick = function() {
			unbanUser(username);
			return false;
		    };

		    var banned = document.createElement('span');
		    banned.innerHTML = "[blocked]";
		    banned.className = "blocked";

		    item.querySelector(".comment").appendChild(banned);
		} else {
		    contents.style.display = "block";

		    actor.innerHTML = "block";
		    actor.onclick = function() {
			banUser(username);
			return false;
		    };
		}
	    }

	    var comments = document.querySelectorAll(".default");

	    for (var i = 0; i < comments.length; ++i) {
		handleItem(comments[i]);
	    }
	});
    }

    init();
})();
