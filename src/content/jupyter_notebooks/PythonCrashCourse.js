import React from 'react'

import python_crash_course_preview_image from './assets/python_crash_course_preview.png'
import learning_log_screenshot_image from './assets/learning_log_screenshot.png'
import alien_invasion_screenshot_image from './assets/alien_invasion_screenshot.png'

export default (
  <div>
    <p>
      <a
        href="https://nbviewer.jupyter.org/github/khiner/notebooks/tree/master/python_crash_course/"
        target="_blank"
        rel="noopener noreferrer">
        <big>This Jupyter notebook</big>
      </a>{' '}
      includes all code, excercises and projects from the{' '}
      <a
        href="https://www.amazon.com/Python-Crash-Course-Hands-Project-Based/dp/1593276036/"
        target="_blank"
        rel="noopener noreferrer">
        <i>Python Crash Course</i> book
      </a>{' '}
      by Eric Matthes. In addition to a great overview of the important features
      of the Python language, this book includes three projects: a "Space
      Invaders"-style game developed with PyGame, a data visualization project
      and a Django app.{' '}
      <a
        href="https://github.com/khiner/notebooks/tree/master/python_crash_course"
        target="_blank"
        rel="noopener noreferrer">
        Here is the GitHub
      </a>.
    </p>

    <p>
      Here's a screenshot of the Space Invadors-style game (<a
        href="https://nbviewer.jupyter.org/github/khiner/notebooks/blob/master/python_crash_course/chapters_12_13_and_14.ipynb"
        target="_blank"
        rel="noopener noreferrer">
        chapters 12, 13 and 14
      </a>):
    </p>
    <img
      src={alien_invasion_screenshot_image}
      alt="Preview of random walk chart from Python Crash Course book"
      style={{ width: '80%' }}
    />

    <p>
      Here's an image of a gorgeous fading random walk chart generated from
      50,000 points with a color gradient, which can be found in{' '}
      <a
        href="https://nbviewer.jupyter.org/github/khiner/notebooks/blob/master/python_crash_course/chapter_15.ipynb"
        target="_blank"
        rel="noopener noreferrer">
        chapter 15
      </a>:
    </p>
    <img
      src={python_crash_course_preview_image}
      alt="Preview of random walk chart from Python Crash Course book"
      style={{ width: '80%' }}
    />

    <p>
      ... and here's a screenshot of the Learning Log project built with Django
      and deployed with Heroku (<a href="https://nbviewer.jupyter.org/github/khiner/notebooks/blob/master/python_crash_course/chapters_18_19_and_20.ipynb">
        chapters 18, 19 and 20
      </a>):
    </p>
    <img
      src={learning_log_screenshot_image}
      alt="Preview of random walk chart from Python Crash Course book"
      style={{ width: '80%' }}
    />
    <p>
      Mine is available for use at{' '}
      <a href="https://learning-log-pcc.herokuapp.com/">
        https://learning-log-pcc.herokuapp.com
      </a>{' '}
      <i>
        (although this was just an exercise and I don't promise any functional
        maintenance if anything's broken!)
      </i>
    </p>

    <p>
      If you end up referring to this notebook while going through the book, or
      if you've already gone through the excercises yourself and want to chat
      about them, I'd love to hear from you!
    </p>
  </div>
)
