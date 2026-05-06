/* global XMLHttpRequest */

import { locales, pageLanguage } from './locales.js'

const ebMCQsInit = function () {
  // check for browser support of the features we use
  // and presence of mcqs
  return navigator.userAgent.indexOf('Opera Mini') === -1 &&
    'querySelector' in document &&
    !!Array.prototype.forEach &&
    'addEventListener' in window &&
    document.querySelectorAll('.question')
}

const ebMCQsFindNumberOfCorrectAnswers = function (questionCode) {
  // not digits
  const digitsRegex = /\D/

  // apply the regex
  const matchedDigitsRegex = questionCode.match(digitsRegex)

  // grab the index of the match
  const numberOfCorrectAnswers = matchedDigitsRegex.index

  return numberOfCorrectAnswers
}

const ebMCQsPositionOfCorrectAnswer = function (trimmedQuestionCode) {
  // vowels * numberOfCorrectAnswers, then consonants * numberOfCorrectAnswers, repeated numberOfCorrectAnswers times
  // vowel regex
  const vowelRegex = /[aeiou]*/

  // apply the regex
  const matchedVowelRegex = trimmedQuestionCode.match(vowelRegex)

  // get the length of the matched thing
  const positionOfCorrectAnswer = matchedVowelRegex[0].length

  return positionOfCorrectAnswer
}

const ebMCQsDobfuscateQuestionCode = function (questionCode) {
  // find the first batch of numbers in the string
  const numberOfCorrectAnswers = ebMCQsFindNumberOfCorrectAnswers(questionCode)

  // trim the string
  const questionCodeLength = questionCode.length
  let trimmedQuestionCode = questionCode.substr(numberOfCorrectAnswers, questionCodeLength)

  // initialise our array
  const correctAnswers = []

  // loop for the right length: numberOfCorrectAnswers long
  for (let i = 0; i < numberOfCorrectAnswers; i++) {
    const positionOfCorrectAnswer = ebMCQsPositionOfCorrectAnswer(trimmedQuestionCode)
    correctAnswers.push(positionOfCorrectAnswer)

    // trim the bit we've used out of the string
    trimmedQuestionCode = trimmedQuestionCode.substr(positionOfCorrectAnswer * 2, trimmedQuestionCode.length)
  }
  return correctAnswers
}

const ebMCQsGetCorrectAnswers = function (question) {
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

const ebMCQsMakeOptionCheckboxes = function (question) {
  // get all the options for this question
  const options = question.querySelectorAll('.mcq-options li')

  // loop over options
  options.forEach(function (option, index) {
    option.setAttribute('data-index', index)
  })
}

const ebMCQsAddButton = function (question) {
  // make the button
  const button = document.createElement('button')
  button.innerHTML = locales[pageLanguage].questions['check-answers-button']
  button.classList.add('check-answer-button')

  // now add it to question, before the feedback
  const questionContent = question.querySelector('.question-content')
  const feedback = questionContent.querySelector('.mcq-feedback')
  questionContent.insertBefore(button, feedback)
}

const ebMCQsGetAllSelected = function (mcqsToCheck) {
  // set the default selectedOptions
  const selectedOptions = {}

  // set it all false for now
  const allTheOptions = mcqsToCheck.querySelectorAll('.mcq-options li')
  allTheOptions.forEach(function (selectedAnswer, index) {
    selectedOptions[index + 1] = false
  })

  // update for the selected ones
  const selectedAnswers = mcqsToCheck.querySelectorAll('.selected')
  selectedAnswers.forEach(function (selectedAnswer) {
    const dataIndex = parseFloat(selectedAnswer.getAttribute('data-index'))
    selectedOptions[dataIndex + 1] = true
  })

  return selectedOptions
}

const ebMCQsHideAllFeedback = function (mcqsToCheck) {
  const feedbacks = mcqsToCheck.querySelectorAll('.mcq-feedback li')
  feedbacks.forEach(function (feedback) {
    // reset the styles
    feedback.classList.remove('mcq-feedback-show')
  })
}

const ebMCQsShowSelectedOptions = function (mcqsToCheck, selectedOptions) {
  const feedbacks = mcqsToCheck.querySelectorAll('.mcq-feedback li')
  feedbacks.forEach(function (feedback, index) {
    // if it's been selected, show it
    if (selectedOptions[index + 1]) {
      feedback.classList.add('mcq-feedback-show')
    }
  })
}

const ebMCQsShowSelectedIncorrectOptions = function (mcqsToCheck, selectedOptions, correctAnswersForThisMCQs) {
  const feedbacks = mcqsToCheck.querySelectorAll('.mcq-feedback li')
  feedbacks.forEach(function (feedback, index) {
    // if it's been selected, and it's incorrect, show it
    if (selectedOptions[index + 1] &&
            selectedOptions[index + 1] !== correctAnswersForThisMCQs[index + 1]) {
      feedback.classList.add('mcq-feedback-show')
    }
  })
}

const ebMCQsMarkSelectedOptions = function () {
  // get all the options
  const questionOptions = document.querySelectorAll('.mcq-options li')

  // loop over them
  questionOptions.forEach(function (questionOption) {
    // listen for clicks on the option and add/remove .selected to the li
    questionOption.addEventListener('click', function () {
      this.classList.toggle('selected')
    })
  })
}

const ebMCQsGetAllCorrectAnswers = function () {
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

const ebMCQsExactlyRight = function (correctAnswersForThisMCQs, selectedOptions) {
  // compare each selectedOption with the correctAnswer
  // if one is wrong, exit with false
  for (const optionNumber in selectedOptions) {
    if (selectedOptions[optionNumber] !== correctAnswersForThisMCQs[optionNumber]) {
      return false
    }
  }

  // if we haven't been kicked out yet, it must be exactly right
  return true
}

const ebMCQsNotAllTheCorrectAnswers = function (correctAnswersForThisMCQs, selectedOptions) {
  let numberOfCorrectAnswers = 0
  let numberOfSelectedCorrectAnswers = 0
  let numberOfSelectedIncorrectAnswers = 0

  // loop through the correct answers
  for (const key in correctAnswersForThisMCQs) {
    // count correct answers
    if (correctAnswersForThisMCQs[key]) {
      numberOfCorrectAnswers++
    }

    // count selected correct answers
    if (correctAnswersForThisMCQs[key] && selectedOptions[key]) {
      numberOfSelectedCorrectAnswers++
    }

    // count selected incorrect answers
    if (!correctAnswersForThisMCQs[key] && selectedOptions[key]) {
      numberOfSelectedIncorrectAnswers++
    }
  }

  // if we haven't selected all the correct answers
  // and we haven't selected any incorrect answers
  if (numberOfSelectedCorrectAnswers < numberOfCorrectAnswers && numberOfSelectedIncorrectAnswers === 0) {
    return true
  }

  return false
}

// get the WordPress ID from a cookie, or return false if we don't have one
const ebMCQsWordPressUserId = function () {
  const cookieName = 'coreproject_sess'

  // get the cookie, split it into bits
  const cookie = document.cookie.split('; ')

  const WordPressUserIdCookie = cookie.find(function (el) {
    // if it starts with coreproject_sess, it's our WP one
    return el.indexOf(cookieName) === 0
  })

  if (!WordPressUserIdCookie) {
    // we're logged out, anon
    return false
  }

  // decode it and remove the cookie name
  const decodedCookie = decodeURIComponent(WordPressUserIdCookie).replace(cookieName + '=', '')

  return decodedCookie
}

// If we have a nav (i.e. web or app output),
// add the WordPress account button to the nav,
// change the text based on logged in or not
const ebMCQsAddWordPressAccountButton = function () {
  // get #nav
  const theNav = document.querySelector('#nav')

  if (theNav) {
    // get the element in the nav that we'll insert before
    const insertBeforeTarget = theNav.querySelector('h2')

    // make the WordPress link to insert into the nav
    const accountLink = document.createElement('a')
    accountLink.innerText = 'Log in'
    accountLink.href = '/login/'
    accountLink.classList.add('wordpress-link')

    // add the account link to the nav
    theNav.insertBefore(accountLink, insertBeforeTarget)

    if (ebMCQsWordPressUserId()) {
      // change the button text and href
      accountLink.innerText = 'My account'
      accountLink.href = '/account/'
    }
  }
}

// Send a bit of JSON for eacn question submission
const ebMCQsSendtoWordPress = function (quizId, score) {
  // if we don't have a user id, early exit
  const userId = ebMCQsWordPressUserId()
  if (!ebMCQsWordPressUserId()) return

  // make the object to send
  const data = {
    action: 'quiz_score', // existing action name
    book_id: 1,
    quiz_id: quizId,
    user_id: userId,
    score
  }

  // set url to send json to
  const wordPressURL = '/wp-admin/admin-ajax.php'

  // send the data
  // first build the data structure into a string
  const query = []
  // make an array of 'key=value' with special characters encoded
  for (const key in data) {
    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
  }
  const dataText = query.join('&') // join the array into 'key=value1&key2=value2...'
  // now send the data
  const req = new XMLHttpRequest() // create the request
  req.open('POST', wordPressURL, true) // put in the target url here!
  req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  req.send(dataText) // so we send the encoded data not the original data structure
}

const ebMCQsButtonClicks = function () {
  // get all the buttons
  const answerCheckingButtons = document.querySelectorAll('.check-answer-button')

  // for each button
  answerCheckingButtons.forEach(function (answerCheckingButton) {
    // listen for clicks on the buttons
    answerCheckingButton.addEventListener('click', function () {
      // get the mcq and its ID
      const mcqsToCheck = this.closest('.question')
      const mcqsToCheckName = mcqsToCheck.getAttribute('data-question')
      // const mcqsToCheckCode = mcqsToCheck.getAttribute('data-question-code')

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

      // set score
      let score = 0

      // if exactly right, mark it so, show options
      if (ebMCQsExactlyRight(correctAnswersForThisMCQs, selectedOptions)) {
        mcqsToCheck.classList.add('mcq-correct')
        ebMCQsShowSelectedOptions(mcqsToCheck, selectedOptions)

        // set score
        score = 1
      } else if (ebMCQsNotAllTheCorrectAnswers(correctAnswersForThisMCQs, selectedOptions)) {
        mcqsToCheck.classList.add('mcq-partially-correct')
        ebMCQsShowSelectedIncorrectOptions(mcqsToCheck, selectedOptions, correctAnswersForThisMCQs)
      } else {
        // show the feedback for the incorrect options
        mcqsToCheck.classList.add('mcq-incorrect')
        ebMCQsShowSelectedIncorrectOptions(mcqsToCheck, selectedOptions, correctAnswersForThisMCQs)
      }

      // now send it all to WordPress
      const quizNumber = mcqsToCheckName.replace('question-', '')
      ebMCQsSendtoWordPress(quizNumber, score)
    })
  })
}

const ebMCQs = function () {
  // early exit for lack of browser support or no mcqs
  if (!ebMCQsInit()) return

  // add the WordPress account button
  ebMCQsAddWordPressAccountButton()

  // mark the document, to use the class in CSS
  document.documentElement.classList.add('js-mcq')

  // get all the questions
  const questions = document.querySelectorAll('.question')

  // loop over questions
  questions.forEach(function (question) {
    // add the interactive stuff: the checkboxes and the buttons
    ebMCQsMakeOptionCheckboxes(question)
    ebMCQsAddButton(question)
  })

  // mark the checked ones more clearly
  ebMCQsMarkSelectedOptions()

  // listen for button clicks and show results
  ebMCQsButtonClicks()
}

export default function ebEpubMCQs () {
  ebMCQs()
}
