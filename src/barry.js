const loadScripts = (element) => {
  element.querySelectorAll('script').forEach(eval);
  return element;
};

const handleResponse = (response) => {
  if (!response.ok) {
    debugger;
    throw new Error('Failed', response);
  }
  return response;
}

const updateHistory = (target, href, updateAddress) => {
  if (updateAddress) {
    return response => {
      history.pushState({target: target, href: href}, 'X', response.url);
      return response;
    }
  } else {
    return response => response;
  }
}

window.onpopstate = function(pop) {
  // If we don't have any state, this must have been a normal page load.
  if (!pop.state) {
    return;
  }

  if (pop.state.target && pop.state.href) {
    // Load the relevant thing into the other thing, if it exists.

  }

};

function disableSender(element) {
  if (element.getAttribute('disabled') != undefined) {
    element.setAttribute('disabled', 'disabled');
    // We want to re-enable this when we leave the page, or when
    // the request we are currently handling finishes.
  }
}

function preventDisabled(event) {
  if (event.target.getAttribute('disabled') != undefined) {
    event.preventDefault();
    event.stopPropagation();
  }
}

document.addEventListener('click', preventDisabled);

// Get the success and failure targets for this element.
function getTargets(element) {
  let targets = {
    success: element.dataset.successTarget || element.dataset.target,
    failure: element.dataset.failureTarget || element.dataset.target
  };

  // If we have a form, then we want to look for the element that triggered our
  // event. That should still have the [data-clicked-at] attribute.
  if (element.nodeName === 'FORM') {
    let clicked = Array.prototype.filter.call(element.elements, x => x.dataset.clickedAt)[0];
    if (clicked) {
      targets.success = clicked.dataset.successTarget || clicked.dataset.target || targets.success;
      targets.failure = clicked.dataset.failureTarget || clicked.dataset.target || targets.failure;
    }
  }

  return targets;
}

function getFormOptions(form) {
  let options = {
    action: form.action,
    method: form.method,
    body: new FormData(form),
    credentials: 'same-origin'
  };
  let clicked = Array.prototype.filter(form.elements, x => x.dataset.clickedAt)[0];
  if (clicked) {
    options.action = clicked.formaction || options.action;
    options.method = clicked.formmethod || options.method;
    if (clicked.name) {
      options.body.append(clicked.name, clicked.value);
    }
  }
  return options;
}

function ajaxLoad(click) {
  const element = click.target;
  const targets = getTargets(element);
  const target = document.querySelector(targets.success);

  if (element.href && target) {
    click.preventDefault();

    fetch(element.href)
      .then(updateHistory(targets.success, element.href, !element.dataset.keepUri))
      .then(r => r.text())
      .then(body => {
        target.innerHTML = body;
        return target;
      })
      .then(loadScripts)
      // .then(updateHistory)
  }
}

document.addEventListener('click', ajaxLoad);


function markLastClicked(click) {
  let element = click.target;

  let lastElement = document.querySelector('[data-clicked-at]');
  if (lastElement) {
    delete lastElement.dataset.clickedAt;
  }

  element.dataset.clickedAt = (new Date()).toJSON();
  setTimeout(() => delete element.dataset.clickedAt, 1000);
}

document.addEventListener('click', markLastClicked);



function ajaxSubmit(submit) {
  const form = submit.target;
  const targets = getTargets(form);
  let options = getFormOptions(form);
  const url = options.action;

  if (targets.success) {
    submit.preventDefault();
    submit.stopPropagation();

    fetch(options.action, options)
      .then(handleResponse)
      .then(req => req.text())
      .then(body => {targets.success.innerHTML = body; return targets.success})
      .then(loadScripts)
  }
}

window.addEventListener('load', function() {
  Array.prototype.forEach.call(
    document.querySelectorAll('form'),
    (form) => form.addEventListener('submit', ajaxSubmit)
  );
});
