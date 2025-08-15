document.addEventListener('DOMContentLoaded', function() {
    const pvpHud = document.getElementById('pvpHud');
    const killsCount = document.getElementById('killsCount');
    const deathsCount = document.getElementById('deathsCount');
    const kdRatio = document.getElementById('kdRatio');
    const streakFill = document.getElementById('streakFill');
    const streakCount = document.getElementById('streakCount');
    const streakContainer = document.querySelector('.streak-container');

    let currentStreak = 0;
    let maxStreak = 10; // Streak maximum pour la barre

    console.log('PVP HUD Script loaded');

    // Écouter les messages de FiveM
    window.addEventListener('message', function(event) {
        const data = event.data;
        
        switch(data.action) {
            case 'showHud':
                showHud();
                break;
            case 'hideHud':
                hideHud();
                break;
            case 'updateStats':
                updateStats(data.kills, data.deaths, data.streak);
                break;
        }
    });

    // Afficher le HUD
    function showHud() {
        pvpHud.classList.remove('hidden');
        pvpHud.classList.add('show');
        console.log('HUD PvP affiché');
    }

    // Cacher le HUD
    function hideHud() {
        pvpHud.classList.add('hidden');
        pvpHud.classList.remove('show');
        console.log('HUD PvP caché');
    }

    // Mettre à jour les statistiques
    function updateStats(kills, deaths, streak = 0) {
        console.log('Mise à jour stats:', { kills, deaths, streak });
        
        // Mettre à jour les valeurs avec animation
        updateStatValue(killsCount, kills);
        updateStatValue(deathsCount, deaths);
        
        // Calculer et mettre à jour le K/D
        const kd = deaths > 0 ? (kills / deaths) : kills;
        updateStatValue(kdRatio, kd.toFixed(2));
        
        // Mettre à jour le streak
        updateStreak(streak || 0);
    }

    // Mettre à jour une valeur de stat avec animation
    function updateStatValue(element, newValue) {
        const oldValue = element.textContent;
        if (oldValue !== newValue.toString()) {
            element.textContent = newValue;
            element.classList.add('updated');
            setTimeout(() => {
                element.classList.remove('updated');
            }, 600);
        }
    }

    // Mettre à jour le kill streak
    function updateStreak(streak) {
        currentStreak = streak;
        streakCount.textContent = streak;
        
        // Calculer le pourcentage pour la barre
        const percentage = Math.min((streak / maxStreak) * 100, 100);
        streakFill.style.width = percentage + '%';
        
        // Effet spécial pour les streaks élevés
        if (streak >= 5) {
            streakContainer.classList.add('high-streak');
        } else {
            streakContainer.classList.remove('high-streak');
        }
        
        // Changer la couleur selon le niveau de streak
        if (streak >= 10) {
            streakFill.style.background = 'linear-gradient(90deg, #ff0044, #ff4400, #ffaa00)';
        } else if (streak >= 5) {
            streakFill.style.background = 'linear-gradient(90deg, #ff4444, #ff8844, #ffaa44)';
        } else {
            streakFill.style.background = 'linear-gradient(90deg, #666666, #888888, #aaaaaa)';
        }
    }

    // Initialiser le HUD caché
    hideHud();
});