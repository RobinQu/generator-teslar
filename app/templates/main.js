console.log("Hello from Teslar");
<% if(renderHandlebarinBrowser) { %>
console.log(window.templates.teslar({name: "Teslar"}));
<% } %>