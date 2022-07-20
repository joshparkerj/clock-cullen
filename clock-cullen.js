const warn = function warn(message) {
  const warning = document.createElement('div');
  warning.classList.add('warning');
  warning.textContent = message;
  document.querySelector('main').appendChild(warning);

  // remove warning after five seconds
  setTimeout(() => { warning.parentElement.removeChild(warning); }, 5000);
};

let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

if (navigator.language.startsWith('es')) { // include spanish language localization
  days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
} else if (navigator.language.startsWith('it')) { // include italian language localization
  days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
} else if (!navigator.language.startsWith('en')) { // unsupported language code
  warn(`Unsupported language preference ${navigator.language}! Using English as default!`);
}

const timeouts = {};

const setDate = function setDate() {
  const currentDateTime = new Date();
  const dateString = `${days[currentDateTime.getDay()]}, ${months[currentDateTime.getMonth()]} ${currentDateTime.getDate()}, ${currentDateTime.getFullYear()}`;
  document.getElementById('date').textContent = dateString;
};

const startClock = function startClock() {
  fetch('http://worldclockapi.com/api/json/utc/now')
    .then((r) => r.json()).then(({ currentDateTime }) => {
      const worldClockTime = new Date(currentDateTime);
      const systemTime = new Date();
      const differences = {
        year: worldClockTime.getFullYear() - systemTime.getFullYear(),
        month: worldClockTime.getMonth() - systemTime.getMonth(),
        day: worldClockTime.getDate() - systemTime.getDate(),
        hour: worldClockTime.getHours() - systemTime.getHours(),
        minute: worldClockTime.getMinutes() - systemTime.getMinutes(),
      };

      const warnDifference = function warnDifference([name, difference]) {
        if (Math.abs(difference) > 0) {
          warn(`Warning! Your system clock seems to be roughly ${Math.abs(difference)} ${name}${Math.abs(difference) === 1 ? '' : 's'} ${difference < 0 ? 'fast' : 'slow'}!`);
          return true;
        }

        return false;
      };

      Object.entries(differences).find((difference) => warnDifference(difference));
    });

  Object.values(timeouts).forEach((timeoutId) => { clearTimeout(timeoutId); });

  const setClockTimeout = function setClockTimeout(elementId, timeoutGetter) {
    const element = document.getElementById(elementId);
    const currentDateTime = new Date();
    if (elementId === 'Hours') {
      const hours = currentDateTime.getHours();
      element.appendChild(new Text(hours % 12));
      document.getElementById('ampm').textContent = `${hours > 12 ? 'P' : 'A'}M`;
      if (hours === 0) setDate(currentDateTime);
    } else {
      element.appendChild(new Text(currentDateTime[`get${elementId}`]().toString().padStart(2, '0')));
    }
    timeouts[elementId] = setTimeout(() => {
      element.innerHTML = '';
      setClockTimeout(elementId, timeoutGetter);
    }, timeoutGetter(currentDateTime));
  };

  setClockTimeout('Hours', (currentDateTime) => (
    (60 * 60 * 1000)
    - currentDateTime.getMinutes() * 60 * 1000
    - currentDateTime.getSeconds() * 1000
    - currentDateTime.getMilliseconds()
  ));

  setClockTimeout('Minutes', (currentDateTime) => (
    (60 * 1000)
    - currentDateTime.getSeconds() * 1000
    - currentDateTime.getMilliseconds()
  ));

  setClockTimeout('Seconds', (currentDateTime) => (
    1000
    - currentDateTime.getMilliseconds()
  ));
};

startClock();
setDate();
