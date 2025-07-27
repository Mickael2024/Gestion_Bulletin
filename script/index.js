class BulletinManager {
    constructor() {
        this.grades = [];
        this.mode = 'simple';
        this.init();
    }

    init() {
        this.bindEvents();
        this.addEmptyRow();
        this.updateResults();
    }

    bindEvents() {
        // Mode de calcul
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.mode = e.target.value;
                this.updateResults();
            });
        });

        // Boutons
        document.getElementById('addRowBtn').addEventListener('click', () => this.addEmptyRow());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // Délégation d'événements pour le tableau
        document.getElementById('tableBody').addEventListener('input', (e) => {
            if (e.target.matches('input')) {
                this.handleInputChange(e);
            }
        });

        document.getElementById('tableBody').addEventListener('click', (e) => {
            if (e.target.matches('.btn-danger')) {
                this.deleteRow(e.target.closest('tr'));
            }
        });

        // Gestion des informations de l'élève
        this.setupStudentInfoEvents();
    }

    setupStudentInfoEvents() {
        // Auto-remplissage de l'année scolaire
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const schoolYearInput = document.getElementById('schoolYear');
        schoolYearInput.placeholder = `${currentYear}-${nextYear}`;
        
        // Validation des champs d'information
        const studentInfoInputs = document.querySelectorAll('.student-info input, .student-info select');
        studentInfoInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateStudentInfo();
            });
        });
    }

    validateStudentInfo() {
        const studentName = document.getElementById('studentName').value.trim();
        const className = document.getElementById('className').value.trim();
        
        // Validation basique - on peut ajouter plus de validation si nécessaire
        const isValid = studentName.length > 0 && className.length > 0;
        
        // Mise à jour visuelle si nécessaire
        return isValid;
    }

    addEmptyRow() {
        const tbody = document.getElementById('tableBody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="text" class="subject-input" placeholder="Nom de la matière" maxlength="50">
            </td>
            <td>
                <input type="number" class="grade-input" placeholder="Note" min="0" max="20" step="0.1">
            </td>
            <td>
                <input type="number" class="coeff-input" placeholder="Coeff" min="0.1" max="10" step="0.1" value="1">
            </td>
            <td class="weighted-grade">-</td>
            <td>
                <button class="btn btn-danger" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
        this.updateResults();
    }

    deleteRow(row) {
        if (document.querySelectorAll('#tableBody tr').length > 1) {
            row.remove();
            this.updateResults();
        } else {
            this.showNotification('Impossible de supprimer la dernière ligne', 'warning');
        }
    }

    handleInputChange(e) {
        const row = e.target.closest('tr');
        const subjectInput = row.querySelector('.subject-input');
        const gradeInput = row.querySelector('.grade-input');
        const coeffInput = row.querySelector('.coeff-input');
        const weightedGradeCell = row.querySelector('.weighted-grade');

        // Validation des notes
        if (e.target === gradeInput) {
            const grade = parseFloat(gradeInput.value);
            if (grade < 0 || grade > 20) {
                gradeInput.classList.add('invalid');
                gradeInput.classList.remove('valid');
            } else if (gradeInput.value !== '') {
                gradeInput.classList.add('valid');
                gradeInput.classList.remove('invalid');
            } else {
                gradeInput.classList.remove('valid', 'invalid');
            }
        }

        // Validation des coefficients
        if (e.target === coeffInput) {
            const coeff = parseFloat(coeffInput.value);
            if (coeff < 0.1 || coeff > 10) {
                coeffInput.classList.add('invalid');
                coeffInput.classList.remove('valid');
            } else if (coeffInput.value !== '') {
                coeffInput.classList.add('valid');
                coeffInput.classList.remove('invalid');
            } else {
                coeffInput.classList.remove('valid', 'invalid');
            }
        }

        // Calcul de la note pondérée
        const grade = parseFloat(gradeInput.value) || 0;
        const coeff = parseFloat(coeffInput.value) || 1;
        const weightedGrade = grade * coeff;
        
        weightedGradeCell.textContent = weightedGrade > 0 ? weightedGrade.toFixed(2) : '-';

        this.updateResults();
    }

    updateResults() {
        const rows = document.querySelectorAll('#tableBody tr');
        let totalNotes = 0;
        let totalCoeff = 0;
        let totalWeighted = 0;
        let validGrades = 0;

        rows.forEach(row => {
            const subject = row.querySelector('.subject-input').value.trim();
            const grade = parseFloat(row.querySelector('.grade-input').value) || 0;
            const coeff = parseFloat(row.querySelector('.coeff-input').value) || 1;

            if (subject && grade > 0) {
                totalNotes += grade;
                totalCoeff += coeff;
                totalWeighted += grade * coeff;
                validGrades++;
            }
        });

        // Calculs
        const average = validGrades > 0 ? totalNotes / validGrades : 0;
        const weightedAverage = totalCoeff > 0 ? totalWeighted / totalCoeff : 0;

        // Mise à jour de l'affichage
        document.getElementById('totalNotes').textContent = totalNotes.toFixed(2);
        document.getElementById('average').textContent = average.toFixed(2);
        document.getElementById('totalCoeff').textContent = totalCoeff.toFixed(1);
        document.getElementById('weightedAverage').textContent = weightedAverage.toFixed(2);

        // Affichage conditionnel selon le mode
        const averageElement = document.getElementById('average').parentElement;
        const weightedElement = document.getElementById('weightedAverage').parentElement;

        if (this.mode === 'simple') {
            averageElement.style.display = 'flex';
            weightedElement.style.display = 'none';
        } else {
            averageElement.style.display = 'none';
            weightedElement.style.display = 'flex';
        }
    }

    clearAll() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ?')) {
            // Effacer le tableau
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';
            this.addEmptyRow();
            
            // Effacer les informations de l'élève
            const studentInfoInputs = document.querySelectorAll('.student-info input, .student-info select');
            studentInfoInputs.forEach(input => {
                if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                } else {
                    input.value = '';
                }
            });
            
            this.showNotification('Toutes les données ont été effacées', 'success');
        }
    }

    exportData() {
        // Récupération des informations de l'élève
        const studentInfo = this.getStudentInfo();
        
        const rows = document.querySelectorAll('#tableBody tr');
        const data = [];
        let hasData = false;

        rows.forEach(row => {
            const subject = row.querySelector('.subject-input').value.trim();
            const grade = parseFloat(row.querySelector('.grade-input').value) || 0;
            const coeff = parseFloat(row.querySelector('.coeff-input').value) || 1;

            if (subject && grade > 0) {
                data.push({
                    matière: subject,
                    note: grade,
                    coefficient: coeff,
                    notePondérée: (grade * coeff).toFixed(2)
                });
                hasData = true;
            }
        });

        if (!hasData) {
            this.showNotification('Aucune donnée à exporter', 'warning');
            return;
        }

        // Calcul des résultats
        const totalNotes = data.reduce((sum, item) => sum + item.note, 0);
        const totalCoeff = data.reduce((sum, item) => sum + item.coefficient, 0);
        const average = totalNotes / data.length;
        const weightedAverage = totalCoeff > 0 ? data.reduce((sum, item) => sum + (item.note * item.coefficient), 0) / totalCoeff : 0;

        const exportData = {
            date: new Date().toLocaleDateString('fr-FR'),
            mode: this.mode,
            informations: studentInfo,
            matières: data,
            résultats: {
                totalNotes: totalNotes.toFixed(2),
                moyenne: average.toFixed(2),
                totalCoefficients: totalCoeff.toFixed(1),
                moyennePondérée: weightedAverage.toFixed(2)
            }
        };

        // Création du fichier
        const content = this.formatExportData(exportData);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulletin_${studentInfo.nom || 'eleve'}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Bulletin exporté avec succès', 'success');
    }

    getStudentInfo() {
        return {
            nom: document.getElementById('studentName').value.trim(),
            classe: document.getElementById('className').value.trim(),
            etablissement: document.getElementById('schoolName').value.trim(),
            anneeScolaire: document.getElementById('schoolYear').value.trim(),
            professeur: document.getElementById('teacherName').value.trim(),
            semestre: document.getElementById('semester').value
        };
    }

    formatExportData(data) {
        let content = `BULLETIN DE NOTES\n`;
        content += `${'='.repeat(50)}\n\n`;

        // Informations de l'élève
        if (data.informations) {
            content += `INFORMATIONS DE L'ÉLÈVE:\n`;
            content += `-`.repeat(30) + `\n`;
            if (data.informations.nom) content += `Nom et Prénom: ${data.informations.nom}\n`;
            if (data.informations.classe) content += `Classe: ${data.informations.classe}\n`;
            if (data.informations.etablissement) content += `Établissement: ${data.informations.etablissement}\n`;
            if (data.informations.anneeScolaire) content += `Année scolaire: ${data.informations.anneeScolaire}\n`;
            if (data.informations.professeur) content += `Professeur principal: ${data.informations.professeur}\n`;
            if (data.informations.semestre) content += `Période: ${data.informations.semestre}\n`;
            content += `\n`;
        }

        content += `Date de génération: ${data.date}\n`;
        content += `Mode de calcul: ${data.mode === 'simple' ? 'Simple' : 'Pondéré'}\n`;
        content += `\n${'='.repeat(50)}\n\n`;

        content += `MATIÈRES:\n`;
        content += `Matière\t\tNote\tCoeff\tNote Pondérée\n`;
        content += `-`.repeat(50) + `\n`;

        data.matières.forEach(item => {
            content += `${item.matière.padEnd(15)}\t${item.note}\t${item.coefficient}\t${item.notePondérée}\n`;
        });

        content += `\n${'='.repeat(50)}\n\n`;
        content += `RÉSULTATS:\n`;
        content += `Total des notes: ${data.résultats.totalNotes}\n`;
        content += `Moyenne: ${data.résultats.moyenne}\n`;
        content += `Total des coefficients: ${data.résultats.totalCoefficients}\n`;
        content += `Moyenne pondérée: ${data.résultats.moyennePondérée}\n`;

        return content;
    }

    showNotification(message, type = 'info') {
        // Suppression des notifications existantes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        // Création de la nouvelle notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Styles pour la notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;

        // Animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        // Gestion de la fermeture
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new BulletinManager();
});
