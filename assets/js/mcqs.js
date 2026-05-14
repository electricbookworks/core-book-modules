import { locales, pageLanguage } from './locales'

function ebMCQsInit () {
  // check for browser support of the features we use
  // and presence of mcqs
  return navigator.userAgent.indexOf('Opera Mini') === -1 &&
            document.querySelector &&
            !!Array.prototype.forEach &&
            window.addEventListener &&
            document.querySelectorAll('.mcq') &&
            !document.querySelector('.table-of-questions')
}

function ebMCQsFindNumberOfCorrectAnswers (questionCode) {
  // not digits
  const digitsRegex = /\D/

  // apply the regex
  const matchedDigitsRegex = questionCode.match(digitsRegex)

  // grab the index of the match
  const numberOfCorrectAnswers = matchedDigitsRegex.index

  return numberOfCorrectAnswers
}

function ebMCQsPositionOfCorrectAnswer (trimmedQuestionCode) {
  // vowels * numberOfCorrectAnswers, then consonants * numberOfCorrectAnswers, repeated numberOfCorrectAnswers times
  // vowel regex
  const vowelRegex = /[aeiou]*/

  // apply the regex
  const matchedVowelRegex = trimmedQuestionCode.match(vowelRegex)

  // get the length of the matched thing
  const positionOfCorrectAnswer = matchedVowelRegex[0].length

  return positionOfCorrectAnswer
}

function ebMCQsDobfuscateQuestionCode (questionCode) {
  // find the first batch of numbers in the string
  const numberOfCorrectAnswers = ebMCQsFindNumberOfCorrectAnswers(questionCode)

  // trim the string
  const questionCodeLength = questionCode.length
  let trimmedQuestionCode = questionCode.substr(numberOfCorrectAnswers, questionCodeLength)

  // initialise our array
  const correctAnswers = []

  // loop for the right length: numberOfCorrectAnswers long
  let i, positionOfCorrectAnswer
  for (i = 0; i < numberOfCorrectAnswers; i += 1) {
    positionOfCorrectAnswer = ebMCQsPositionOfCorrectAnswer(trimmedQuestionCode)
    correctAnswers.push(positionOfCorrectAnswer)

    // trim the bit we've used out of the string
    trimmedQuestionCode = trimmedQuestionCode.substr(positionOfCorrectAnswer * 2, trimmedQuestionCode.length)
  }
  return correctAnswers
}

function ebMCQsGetCorrectAnswers (question) {
  // get the correct answers
  const questionCode = question.getAttribute('data-question-code')
  const correctAnswers = ebMCQsDobfuscateQuestionCode(questionCode)

  // set the default correctAnswersObj
  const correctAnswersObj = {}

  // get all the feedbacks for this questions
  const feedbacks = question.querySelectorAll('.mcq-feedback li')

  // set it all false for now
  feedbacks.forEach(function (feedback, index) {
    correctAnswersObj[index + 1] = false
  })

  // update correctAnswersObj from the correctAnswers array
  correctAnswers.forEach(function (correctAnswer) {
    correctAnswersObj[correctAnswer] = true
  })

  return correctAnswersObj
}

function ebMCQsMakeOptionCheckboxes (question) {
  const dataQuestion = question.getAttribute('data-question')
  // get all the options for this question
  const options = question.querySelectorAll('.mcq-options li')

  // loop over options
  options.forEach(function (option, index) {
    // create a unique id for this mcq option
    const optionLetter = String.fromCharCode(index + 65)
    const id = dataQuestion + '-option-' + optionLetter

    // make the checkbox
    const checkbox = document.createElement('input')
    checkbox.setAttribute('type', 'checkbox')
    checkbox.setAttribute('data-index', index)
    checkbox.setAttribute('id', id)
    checkbox.setAttribute('name', dataQuestion)

    // make a label to put around the checkbox
    const label = document.createElement('label')
    label.setAttribute('for', id)

    // the label gets the checkbox as a child
    label.appendChild(checkbox)

    // add a span for numbering the options
    const number = document.createElement('span')
    number.classList.add('option-number')
    number.innerHTML = (index + 1).toString() + '. '

    // wrap the text in a span for styling
    const span = document.createElement('span')
    span.classList.add('option-text')
    span.innerHTML = option.innerHTML

    // now the label gets the option text
    // label.innerHTML = label.innerHTML + option.innerHTML
    label.appendChild(number)
    label.appendChild(span)

    // remove the now-duplicate option text
    // and put the label inside the option
    option.innerHTML = ''
    option.appendChild(label)

    // make the option non-bookmarkable
    option.setAttribute('data-bookmarkable', 'no')
  })
}

function ebMCQsAddButton (question) {
  // make the button
  const button = document.createElement('button')
  button.innerHTML = locales[pageLanguage].questions['check-answers-button']
  button.classList.add('check-answer-button')

  // now add it to question, after the options
  const feedback = question.querySelector('.mcq-feedback, .question-feedback')
  feedback.insertAdjacentElement('beforebegin', button)
}

const ebMCQsMakeQuestionAccessible = function (question) {
  // wrap everything inside the div in a fieldset
  const questionContents = question.innerHTML
  const fieldset = document.createElement('fieldset')

  fieldset.innerHTML = questionContents
  question.innerHTML = ''
  question.appendChild(fieldset)
}

function ebMCQsGetAllSelected (mcqsToCheck) {
  // set the default selectedOptions
  const selectedOptions = {}

  // set it all false for now
  const allTheCheckboxes = mcqsToCheck.querySelectorAll('[type="checkbox"]')
  allTheCheckboxes.forEach(function (selectedCheckbox, index) {
    selectedOptions[index + 1] = false
  })

  // update for the selected ones
  const selectedCheckboxes = mcqsToCheck.querySelectorAll('[type="checkbox"]:checked')
  selectedCheckboxes.forEach(function (selectedCheckbox) {
    const dataIndex = parseFloat(selectedCheckbox.getAttribute('data-index'))
    selectedOptions[dataIndex + 1] = true
  })

  return selectedOptions
}

function ebMCQsHideAllFeedback (mcqsToCheck) {
  const feedback = mcqsToCheck.querySelector('.mcq-feedback')
  const feedbacks = feedback.querySelectorAll('li')
  feedback.classList.remove('mcq-feedback-shown-inside')

  feedbacks.forEach(function (feedback) {
    // reset the styles
    feedback.classList.remove('mcq-feedback-show')
  })
}

function ebMCQsShowSelectedOptions (mcqsToCheck, selectedOptions) {
  const feedback = mcqsToCheck.querySelector('.mcq-feedback')
  const feedbacks = feedback.querySelectorAll('li')
  feedback.classList.add('mcq-feedback-shown-inside')

  feedbacks.forEach(function (feedback, index) {
    // if it's been selected, show it
    if (selectedOptions[index + 1]) {
      feedback.classList.add('mcq-feedback-show')
    }

    // make the feedback non-bookmarkable
    feedback.setAttribute('data-bookmarkable', 'no')
  })
}

function ebMCQsShowSelectedIncorrectOptions (mcqsToCheck, selectedOptions, correctAnswersForThisMCQs) {
  const feedback = mcqsToCheck.querySelector('.mcq-feedback')
  const feedbacks = feedback.querySelectorAll('li')
  feedback.classList.add('mcq-feedback-shown-inside')

  feedbacks.forEach(function (feedback, index) {
    // if it's been selected, and it's incorrect, show it
    if (selectedOptions[index + 1] &&
                selectedOptions[index + 1] !== correctAnswersForThisMCQs[index + 1]) {
      feedback.classList.add('mcq-feedback-show')
    }

    // make the feedback non-bookmarkable
    feedback.setAttribute('data-bookmarkable', 'no')
  })
}

function ebMCQsMarkSelectedOptions () {
  // get all the options
  const questionOptions = document.querySelectorAll('.mcq-options li')

  // loop over them
  questionOptions.forEach(function (questionOption) {
    // listen for clicks on the label and add/remove .selected to the li
    questionOption.addEventListener('click', function () {
      if (this.querySelector('[type="checkbox"]:checked')) {
        this.classList.add('selected')
      } else {
        this.classList.remove('selected')
      }
    })
  })
}

function ebMCQsGetAllCorrectAnswers () {
  // initialise answer store
  const ebMCQsCorrectAnswersForPage = {}

  // get all the questions
  const questions = document.querySelectorAll('.question')

  // loop over questions
  questions.forEach(function (question) {
    // get the correct answers
    const correctAnswersObj = ebMCQsGetCorrectAnswers(question)

    // get the ID, then put the answer set into the store
    const dataQuestion = question.getAttribute('data-question')
    ebMCQsCorrectAnswersForPage[dataQuestion] = correctAnswersObj
  })

  return ebMCQsCorrectAnswersForPage
}

function ebMCQsExactlyRight (correctAnswersForThisMCQs, selectedOptions) {
  // compare each selectedOption with the correctAnswer
  // if one is wrong, exit with false
  let optionNumber
  for (optionNumber in selectedOptions) {
    if (selectedOptions[optionNumber] !== correctAnswersForThisMCQs[optionNumber]) {
      return false
    }
  }

  // if we haven't been kicked out yet, it must be exactly right
  return true
}

function ebMCQsNotAllTheCorrectAnswers (correctAnswersForThisMCQs, selectedOptions) {
  let numberOfCorrectAnswers = 0
  let numberOfSelectedCorrectAnswers = 0
  let numberOfSelectedIncorrectAnswers = 0

  // loop through the correct answers
  let key
  for (key in correctAnswersForThisMCQs) {
    // count correct answers
    if (correctAnswersForThisMCQs[key]) {
      numberOfCorrectAnswers += 1
    }

    // count selected correct answers
    if (correctAnswersForThisMCQs[key] && selectedOptions[key]) {
      numberOfSelectedCorrectAnswers += 1
    }

    // count selected incorrect answers
    if (!correctAnswersForThisMCQs[key] && selectedOptions[key]) {
      numberOfSelectedIncorrectAnswers += 1
    }
  }

  // if we haven't selected all the correct answers
  // and we haven't selected any incorrect answers
  if (numberOfSelectedCorrectAnswers < numberOfCorrectAnswers && numberOfSelectedIncorrectAnswers === 0) {
    return true
  }

  return false
}

function ebMCQsButtonClicks () {
  // get all the buttons
  const answerCheckingButtons = document.querySelectorAll('.check-answer-button')

  // for each button
  answerCheckingButtons.forEach(function (answerCheckingButton) {
    // listen for clicks on the buttons
    answerCheckingButton.addEventListener('click', function () {
      // get the mcq and it's ID
      const mcqsToCheck = this.closest('[data-question]') // 'this' is the button
      const mcqsToCheckName = mcqsToCheck.getAttribute('data-question')
      // var mcqsToCheckCode = mcqsToCheck.getAttribute('data-question-code'); // not used

      // reset the styles
      ebMCQsHideAllFeedback(mcqsToCheck)

      // get the selected options (the checked ones)
      const selectedOptions = ebMCQsGetAllSelected(mcqsToCheck)

      // get the correct answers for this mcq
      const ebMCQsCorrectAnswersForPage = ebMCQsGetAllCorrectAnswers()
      const correctAnswersForThisMCQs = ebMCQsCorrectAnswersForPage[mcqsToCheckName]

      mcqsToCheck.classList.remove('mcq-incorrect')
      mcqsToCheck.classList.remove('mcq-partially-correct')
      mcqsToCheck.classList.remove('mcq-correct')

      // if exactly right, mark it so, show options
      if (ebMCQsExactlyRight(correctAnswersForThisMCQs, selectedOptions)) {
        mcqsToCheck.classList.add('mcq-correct')
        ebMCQsShowSelectedOptions(mcqsToCheck, selectedOptions)
      } else if (ebMCQsNotAllTheCorrectAnswers(correctAnswersForThisMCQs, selectedOptions)) {
        mcqsToCheck.classList.add('mcq-partially-correct')
        ebMCQsShowSelectedIncorrectOptions(mcqsToCheck, selectedOptions, correctAnswersForThisMCQs)
      } else {
        // show the feedback for the incorrect options
        mcqsToCheck.classList.add('mcq-incorrect')
        ebMCQsShowSelectedIncorrectOptions(mcqsToCheck, selectedOptions, correctAnswersForThisMCQs)
      }
    })
  })
}

export default function ebMCQs (config) {
  // early exit for lack of browser support or no mcqs
  if (!ebMCQsInit()) {
    return
  }

  // mark the document, to use the class in CSS
  document.documentElement.classList.add('js-mcq')

  // get all the questions
  const questions = document.querySelectorAll('.question')

  // loop over questions
  questions.forEach(function (question) {
    // add the interactive stuff: the checkboxes and the buttons
    ebMCQsMakeOptionCheckboxes(question)
    ebMCQsAddButton(question)
    // add the extra elements needed for accessibility
    ebMCQsMakeQuestionAccessible(question)
  })

  // mark the checked ones more clearly
  ebMCQsMarkSelectedOptions()

  // listen for button clicks and show results
  ebMCQsButtonClicks()
}
