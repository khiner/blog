import Link from 'components/Link'

export default (
  <div>
    <p>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/python_for_data_analysis/index.ipynb">
        <big>This Jupyter notebook</big>
      </Link>{' '}
      <small>
        (<Link href="https://github.com/khiner/notebooks/tree/master/python_for_data_analysis">raw GitHub link</Link>)
      </small>{' '}
      includes every line of code in the{' '}
      <Link href="https://www.amazon.com/Python-Data-Analysis-Wrangling-IPython/dp/1491957662/">
        Python for Data Analysis
      </Link>{' '}
      book (2nd addition) by Wes McKinney, who is the creator of the <code>pandas</code> library that is the subject of
      the book. The notebook is the result of me simply coding along with every executable line in the book.
    </p>
    <p>
      <small>
        <i>
          Full disclosure: This is probably the lowest-value notebook I have published (or will publish), since the
          author already provides Jupyter notebooks for each of the chapters{' '}
          <Link href="https://github.com/wesm/pydata-book">here</Link>. So this is more of a "this is what I've been up
          to" post.{' '}
        </i>
      </small>
    </p>
    <h2>
      Why <code>pandas</code>?
    </h2>
    <p>
      <big>My main takeaway</big> from <i>Python for Data Analysis</i> is that <code>pandas</code> is flipping awesome,
      and one of the very few frameworks I've encountered for which I have no reservations about saying the extra
      abstractions are well worth it.
    </p>
    <p>
      I'm not going to put a lot of effort here to justify that enthusiasm, as its evangelism is widespread. I will just
      say I now understand why so many libraries have put so much effort into integrating with it deeply, and I would
      recommend getting to know it well if you are serious about getting fluent with data science in Python. I myself
      look forward to getting more familiar with it.
    </p>
    <p>
      I've used <code>pandas</code> before at work, but only in the most basic way, as a convenient wrapper for loading
      and processing data (usually with <code>scikit-learn</code>
      ).
    </p>
    <p>
      The <code>DataFrame</code> is its main table-like data structure. It is designed to be a direct analogue to{' '}
      <Link href="http://www.r-tutor.com/r-introduction/data-frame">R's data frames</Link>. In both frameworks,{' '}
      <code>DataFrame</code>s are designed to strike a balance between the expressiveness of SQL queries (hierarchical
      indices, <code>select</code>, <code>join</code>, <code>merge</code>, etc.), the numerical convenience of matrices
      and vectors, and the natural table/cell intuition of spreadsheets. <code>pandas</code> adds to this set of
      features a natural integration with Python's built-in language features.
    </p>
    <p>
      I am more familiar with <code>numpy</code>, so I had basically thought <code>pandas</code> was a tool to get data
      from some other format (CSV, JSON, etc.) into a kind of labelled-
      <code>numpy</code> format as quickly as possible. Without taking the time to understand the philosophy and
      parlance of <code>pandas</code>' core data structures, I <i>usually</i> found the incantations required to access
      and manipulate them as slightly clunky (except when their awesomeness was immediately obvious, such as their
      ability to handle missing data seamlessly). I relied on the DataFrame's <code>as_matrix()</code> method to get
      back to what I considered a more sane representation that can be indexed with a natural <code>data[i][j]</code>{' '}
      kind of notation.
    </p>
    <p>
      However, after getting more familiar with the <code>DataFrame</code>, the more fundamental <code>Index</code> type
      underneath it, and the excellent <code>Series</code>, which simplifies everything time-related (including
      well-labelled plotting, time-zone handling and even{' '}
      <Link href="https://pandas.pydata.org/pandas-docs/stable/generated/pandas.Series.resample.html#pandas.Series.resample">
        resampling!
      </Link>
      ), I am much more comfortable working within these data structures as first-order abstractions without wanting to
      always pull out the underlying primitive data types and manipulate them manually. (I still need a <i>ton</i> of
      practice to really feel comfortable, though!)
    </p>
    <h2>Example</h2>
    Rather than provide any examples inline, I will link to the section that I found most interesting.{' '}
    <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/python_for_data_analysis/chapter_14/chapter_14.ipynb#scrollTo=Wxq_PeK00pMz">
      "Analyzing Naming Trends" in Chapter 14
    </Link>{' '}
    combines many of the techniques covered in the book to analyze the evolution of baby names since 1880, and it is
    great practice for using Pandas to quickly explore and gain high-level insight into a new dataset.
  </div>
)
