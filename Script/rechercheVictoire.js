const btn = document.getElementById("recherche");

btn.addEventListener('click', () => {
    const search = document.getElementById("searchBar").value.trim();

    if (search.toLowerCase().trim() === 'nird inclusion responsable durable') {
        document.location.href = "./page/victoire.html";
    } 
});
