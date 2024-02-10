$.getJSON("https://api.ipify.org?format=json",
      function(data) {
        $("#ip").html(data.ip);
      })
