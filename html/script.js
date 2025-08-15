document.addEventListener('DOMContentLoaded', function() {
    const arenaMenu = document.getElementById('arenaMenu');
    const closeBtn = document.getElementById('closeBtn');
    const arenaCards = document.querySelectorAll('.arena-card');
    const joinBtns = document.querySelectorAll('.join-btn');
    
    // Éléments HUD
    const pvpHud = document.getElementById('pvpHud');
    const killsCount = document.getElementById('killsCount');
    const deathsCount = document.getElementById('deathsCount');
    const kdRatio = document.getElementById('kdRatio');
    const streakFill = document.getElementById('streakFill');
    const streakCount = document.getElementById('streakCount');
    const streakContainer = document.querySelector('.streak-container');

    console.log('PVP Script loaded');

    // Nom de la ressource
    const resourceName = 'pvp_pack';
    
    let currentStreak = 0;
    let maxStreak = 10; // Streak maximum pour la barre

    // Écouter les messages de FiveM
    window.addEventListener('message', function(event) {
        const data = event.data;
        console.log('Message reçu:', data);
        
        if (data.action === 'openArenaMenu') {
            console.log('Ouverture du menu arène');
            showMenu();
        } else if (data.action === 'closeArenaMenu') {
            console.log('Fermeture du menu arène');
            hideMenu();
        } else if (data.action === 'showHud') {
            console.log('Affichage du HUD PvP');
            showHud();
            if (data.kills !== undefined) {
                updateStats(data.kills, data.deaths, data.streak);
            }
        } else if (data.action === 'hideHud') {
            console.log('Masquage du HUD PvP');
            hideHud();
        } else if (data.action === 'updateStats') {
            console.log('Mise à jour des stats:', data);
            updateStats(data.kills, data.deaths, data.streak);
        }
    });

    // Afficher le menu
    function showMenu() {
        arenaMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Cacher le menu
    function hideMenu() {
        arenaMenu.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Envoyer message à FiveM
        fetch(`https://${resourceName}/closeMenu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }).catch(error => {
            console.error('Erreur fermeture menu:', error);
        });
    }
    
    // Afficher le HUD
    function showHud() {
        if (pvpHud) {
            pvpHud.classList.remove('hidden');
            pvpHud.classList.add('show');
            console.log('HUD PvP affiché');
        }
    }

    // Cacher le HUD
    function hideHud() {
        if (pvpHud) {
            pvpHud.classList.add('hidden');
            pvpHud.classList.remove('show');
            console.log('HUD PvP caché');
        }
    }

    // Mettre à jour les statistiques
    function updateStats(kills, deaths, streak = 0) {
        console.log('Mise à jour stats:', { kills, deaths, streak });
        
        if (!killsCount || !deathsCount || !kdRatio) {
            console.error('Éléments HUD non trouvés');
            return;
        }
        
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
        if (!element) return;
        
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
        if (!streakFill || !streakCount || !streakContainer) return;
        
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

    // Rejoindre une arène
    function joinArena(arenaIndex) {
        console.log('Tentative de rejoindre arène:', arenaIndex);
        
        if (!arenaIndex || arenaIndex < 1 || arenaIndex > 4) {
            console.error('Index arène invalide:', arenaIndex);
            return;
        }
        
        fetch(`https://${resourceName}/selectArena`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                index: parseInt(arenaIndex)
            })
        }).then(response => {
            console.log('Réponse sélection arène:', response.status);
            hideMenu();
        }).catch(error => {
            console.error('Erreur sélection arène:', error);
            hideMenu();
        });
    }

    // Event listeners pour les cartes d'arène
    arenaCards.forEach(card => {
        const arenaIndex = parseInt(card.dataset.arena);
        
        card.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Carte arène cliquée:', arenaIndex);
            joinArena(arenaIndex);
        });
    });

    // Event listeners pour les boutons rejoindre
    joinBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const card = e.target.closest('.arena-card');
            const arenaIndex = parseInt(card.dataset.arena);
            console.log('Bouton rejoindre cliqué:', arenaIndex);
            joinArena(arenaIndex);
        });
    });

    // Bouton fermer
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Bouton fermer cliqué');
        hideMenu();
    });

    // Fermer avec Échap
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            hideMenu();
        }
    });

    // Fermer en cliquant sur l'arrière-plan
    arenaMenu.addEventListener('click', function(e) {
        if (e.target === arenaMenu) {
            hideMenu();
        }
    });

    console.log('Tous les event listeners ajoutés');
});