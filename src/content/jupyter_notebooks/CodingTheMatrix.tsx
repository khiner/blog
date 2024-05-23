import Image from 'components/Image'
import Link from 'components/Link'
import { Python } from '../CodeBlock'

import plot_complex_points from './assets/coding_the_matrix/plot_complex_points.png'
import plot_complex_points_rotate_scale from './assets/coding_the_matrix/plot_complex_points_rotate_scale.png'
import three_approaches from './assets/coding_the_matrix/three_approaches_to_lin_alg.gif'
import board_transformed from './assets/coding_the_matrix/board_transformed.png'
import board from './assets/coding_the_matrix/board.png'
import dali_compressed from './assets/coding_the_matrix/dali_compressed.png'
import mandelbrot_rotated from './assets/coding_the_matrix/mandelbrot_rotated.png'

import face_1 from './assets/coding_the_matrix/faces/img01.png'
import face_2 from './assets/coding_the_matrix/faces/img02.png'
import face_3 from './assets/coding_the_matrix/faces/img03.png'
import face_4 from './assets/coding_the_matrix/faces/img04.png'
import face_5 from './assets/coding_the_matrix/faces/img05.png'
import nonface_1 from './assets/coding_the_matrix/unclassified/img00.png'
import nonface_2 from './assets/coding_the_matrix/unclassified/img06.png'
import nonface_3 from './assets/coding_the_matrix/unclassified/img07.png'
import nonface_4 from './assets/coding_the_matrix/unclassified/img08.png'
import nonface_5 from './assets/coding_the_matrix/unclassified/img09.png'

export default (
  <div>
    <p>
      <Link href="http://codingthematrix.com/">
        <i>Coding the Matrix</i>
      </Link>{' '}
      seems to have a good reputation as a "computer science approach" to Linear Algebra. It's popular and mostly well
      reviewed on Amazon, and is frequently recommended on QA sites. I made a set of{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/index.ipynb">
        Jupyter notebooks
      </Link>{' '}
      <small>
        (<Link href="https://github.com/khiner/notebooks/tree/master/coding_the_matrix">raw Github link</Link>)
      </small>{' '}
      for every problem, lab and code example in the book. It has formatted redefinitions of each problem, review
      question and lab statement, along with solutions, and should function as a decent solution manual for anyone
      working through the book.
    </p>
    <h2>Many paths to understanding linear algebra</h2>
    <p>
      As demonstrated in{' '}
      <Link href="https://youtu.be/fNk_zzaMoSs">this incredible introduction to vectors by 3Blue1Brown</Link>
      ,
      <Image src={three_approaches} alt="Three approaches to linear algebra from 3Blue1Brown" />
      linear algebra is framed in at least three major perspectives - the physics, math and computer science
      perspectives. They each view the subject through distinct (but complementary and fundamentally equivalent) lenses.
      They each have strong supporters and some detractors.
    </p>
    <p>
      The mathematician and the computer scientist seem to butt heads the most. Mathematicians argue for the value of
      generalization and context-invariant representation, while the CS gang focuses on practically computable solutions
      to discrete numerical problems. For example, the best selling{' '}
      <Link href="https://www.amazon.com/Linear-Algebra-Right-Undergraduate-Mathematics/dp/3319110799">
        Linear Algebra Done Right
      </Link>
      , whose title is itself a tongue-in-cheek reference to this factionalism, takes the "pure-math" perspective with
      pride, boasting that its "novel approach banishes determinants to the end of the book" on the second line of its
      Amazon plug.
      <sup>
        <a href="#aside_1">1</a>
      </sup>
    </p>
    <h2>
      <i>
        The <small>(mostly)</small> Computer Science Approach
      </i>
      ™
    </h2>
    <p>
      <i>Coding the Matrix</i> seems to be the common recommendation for any computer science student looking to brush
      up on linear algebra in preparation for hands-on work in applied statistics and machine learning.
    </p>
    <p>
      On the surface, it's true that the book doubles down on the computer science approach - almost every major concept
      discussed is ultimately implemented and explained by the author, or its implementation is assigned in a lab or
      exercise. If you supplement the reading with the author's{' '}
      <Link href="https://cs.brown.edu/video/channels/coding-matrix-fall-2014/">Brown University lectures</Link>, you'll
      hear him say repeatedly that he adopts this approach, in part, because implementing the ideas helps students{' '}
      <i>own</i> the material. That is something I can always get behind, and this book does that well. I feel much more
      ownership over these concepts than I did before reading it.
    </p>
    <p>
      What surprised me about this book, however, is how far it turned out to lean towards{' '}
      <i>The Pure Mathematics Approach</i>
      ™!
    </p>
    <ul>
      <li>
        The matrix and vector implementations built up early on in the book (partly as exercises), and used throughout
        the course, require explicit domains. (A numerical domain is never assumed in the code, and rarely in the text,
        even when it would be more convenient.)
      </li>
      <li>
        Matrix and vector operations are treated as function mappings that sometimes have integers as their domain, and
        rarely, if ever, as "lists of numbers".
      </li>
      <li>
        The contents of the book are no more conceptually dense than any undergrad linear algebra course. However, it is
        proof-heavy in the extreme. This is good for depth if you have the patience and time to dig into the proofs
        enough to really grok them. But there is very little hand holding along the path to understanding. I think the
        book could benefit from more focus on high-level intuition to supplement the proofs. In some chapters, the
        material is largely a series of proofs with a sentence or two before each proof as introduction.
      </li>
      <li>
        Just like <i>Linear Algebra Done Wrong</i>, determinants are <i>also</i> banished here to the end of the book.
        In fact, determinants are not even <i>mentioned</i> in the Brown University lectures, and in the book they are
        relegated to the position of "helpful in mathematical arguments, but turn out to be rarely useful in matrix
        computations". So the mathematicians and computer scientists both seem to agree that determinants are only worth
        a side-eyed sneer, but the mathematician thinks so because they're conceptually bulky and arguably not
        fundamental, and the computer scientist simply has no use for them.
        <sup>
          <a href="#aside_2">2</a>
        </sup>
      </li>
    </ul>
    <p>
      If I were to summarize the most "shut-up-and-calculate" kind of lesson from this book, it would be to pretend,
      where possible, that matrix inversions don't exist. They are slow to compute, and there always seems to be a
      clever way to work around actually computing the inverse of a matrix. In <i>Coding the Matrix</i>, inversions are
      used only mathematically in proofs. If one is needed in an assignment, it is formulated as an exact or approximate
      solution to a matrix-vector equation instead.
    </p>
    <p>
      Overall, I think this book is offers a lot for the programming-inclined looking to get their hands dirty on a
      well-guided tour through a variety of domains. No single book can represent all the useful ways of understanding
      this immense subject. Linear algebra is a field that rewards (and arguably requires){' '}
      <i>relearning in several different ways</i> in order to solidify understanding. I will continue learning about it
      from different angles.
    </p>
    <h2>Greatest hits</h2>
    <p>
      The following is a selection of some notable example material selected from each chapter's notebook. I offer no
      explanations here, and provide these as a selection of the material covered in the book. For a full understanding
      of what's going on in these examples, the book is your resource.
    </p>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_0/chapter_0.ipynb">
        Chapter 0
      </Link>
    </h3>
    (Just introduces Python.)
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_1/chapter_1.ipynb">
        Chapter 1
      </Link>
    </h3>
    <Python>{`pts = [(x + 1j * (len(data) - y)) for (y, row) in enumerate(data) for (x, intensity) in enumerate(row) if np.mean(intensity) < 120]
plot_complex_points(pts, xlim=(-10, 200), ylim=(-10, 200))`}</Python>
    <Image src={plot_complex_points} />
    <p>
      <strong>Task 1.4.20:</strong> Write a comprehension that transforms the set pts by translating it so the image is
      centered, then rotating it by $π / 4$, then scaling it by half. Plot the result.
    </p>
    <Python>{`plot_complex_points([rotate(z, pi/4) / 2 for z in translate_to_origin(pts)], xlim=(-200, 200), ylim=(-200, 200))`}</Python>
    <Image src={plot_complex_points_rotate_scale} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_2/chapter_2.ipynb">
        Chapter 2
      </Link>
    </h3>
    <h3>2.12.5: Not your average Democrat</h3>{' '}
    <p>
      <strong>Task 2.12.7:</strong> Write a procedure <code>find_average_similarity(sen, sen_set, voting_dict)</code>{' '}
      that, given the name <code>sen</code> of a senator, compares that senator's voting record to the voting records of
      all senators whose names are in <code>sen_set</code>, computing a dot-product for each, and then returns the
      average dot-product.
    </p>
    <p>
      Use your procedure to compute which senator has the greatest average similarity with the set of Democrats (you can
      extract this set from the input file).
    </p>
    <Python>{`def find_average_similarity(sen, sen_set, voting_dict):
    all_dot_products = [policy_compare(sen, other_sen, voting_dict) for other_sen in sen_set]
    return sum(all_dot_products) / len(all_dot_products)

senators_for_party = {}
for party in ['D', 'R']:
    senators_for_party[party] = [s.split()[0] for s in l if s.split()[1] == party]

average_similarity_with_dems_for_sen = {sen: find_average_similarity(sen, senators_for_party['D'], voting_dict) for sen in voting_dict.keys()}
max(average_similarity_with_dems_for_sen, key=average_similarity_with_dems_for_sen.get)
> 'Biden'`}</Python>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_3/chapter_3.ipynb">
        Chapter 3
      </Link>
    </h3>
    <p>
      <strong>Problem 3.8.4:</strong> Let $a, b$ be real numbers. Consider the equation $z = ax + by$. Prove that there
      are two 3-vectors {`$\\boldsymbol{v_1}, \\boldsymbol{v_2}$`} such that the set of points $[x, y, z]$ satisfying
      the equation is exactly the set of linear combinations of {`$\boldsymbol{v_1}$`} and {`$\boldsymbol{v_2}$`}.
    </p>
    <p>Let's start by finding two linearly independent solutions to $ax + by = z$:</p>
    <p>
      {`$1a + 0b = a$
      $0a + 1b = b$`}
    </p>
    <p>
      Thus, $[1, 0, a]$ and $[0, 1, b]$ are solutions. Now, we will show that if $ax + by = z$, then there exists{' '}
      {`$\\delta, \\gamma \\in \\mathbb{R}$`} such that{' '}
      {`$[x, y, z] = \\delta [1, 0, a] + \\gamma [0, 1, b] = [\\delta, \\gamma, \\delta a + \\gamma b]$`}:
    </p>
    <p>If $ax + by = z$, then we can use basic algebra to find expressions for $x$, $y$ and $z$:</p>
    <p>{`$x = \\frac{z - by}{a}, y = \\frac{z - ax}{b}, z = ax + by$`}</p>
    <p>
      If we let {`$\\delta = x = \\frac{z - by}{a}$ and $\\gamma = y = \\frac{z - ax}{b}$`}, then
      {`$z = \\delta a + \\gamma b = (\\frac{z - by}{a}) a + (\\frac{z - ax}{b}) b = z - by + z - ax\\\\
      => z = ax + by$`}
      QED
    </p>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_4/chapter_4_with_lab_and_exercises.ipynb">
        Chapter 4
      </Link>
    </h3>
    <p>
      <strong>Task 4.15.11:</strong> Write a procedure <code>reflect_about(x1, y1, x2, y2)</code> that takes two points
      and returns the matrix that reflects about the line defined by the two points.
    </p>
    <Python>{`def reflect_about(x1, y1, x2, y2):
    m = (y2 - y1) / (x2 - x1) if x2 - x1 != 0 else 1
    b = y1 - m * x1 theta = math.atan(m)
    return translation(0, b) * rotation(theta) * reflect_x() * rotation(-theta) * translation(0, -b)

print(reflect_about(2, 2, 3, 1) * Vec({'x', 'y', 'u'}, {'x': 1, 'y': 1, 'u': 1}))

 u x y
------
 1 3 3`}</Python>
    <Python>{`mat2display(reflect_about(0, 100, 256, 200) * mandelbrot_locations, mandelbrot_colors)`}</Python>
    <Image src={mandelbrot_rotated} style={{ maxWidth: 180 }} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_5/chapter_5_with_lab.ipynb">
        Chapter 5
      </Link>
    </h3>
    <p>
      <strong>Task 5.12.7:</strong> Each column of <code>Y_pts</code> gives the whiteboard-coordinate representation
      $(y_1, y_2, y_3)$ of a point {`$\\boldsymbol{q}$`} in the image. We need to construct another matrix{' '}
      <code>Y_board</code> in which each column gives the whiteboard-coordinate representation $(y_1/y_3,y_2/y_3,1)$ of
      the corresponding point {`$\\boldsymbol{p}$`} in the plane containing the whiteboard. Write a procedure{' '}
      <code>mat_move2board(Y)</code> with the following spec:
    </p>
    <ul>
      <li>
        <i>input:</i> a <code>Mat</code> each column of which is a vector giving the whiteboard coordinates of a point{' '}
        {`$\\boldsymbol{q}$`}
      </li>
      <li>
        <i>output:</i> a <code>Mat</code> each column of which is the corresponding point in the whiteboard plane (the
        point of intersection with the whiteboard plane of the line through the origin and {`$\\boldsymbol{q}$`}
      </li>
    </ul>
    <p>
      Once your <code>mat_move2board</code> procedure is working, use it to derive the matrix <code>Y_board</code> from{' '}
      <code>Y_pts</code>:
    </p>
    <Python>{`from matutil import mat2coldict, coldict2mat
def mat_move2board(Y_pts):
    coldict = mat2coldict(Y_pts)
    return coldict2mat({k: move2board(v) for k, v in coldict.items()})
  
  Y_board = mat_move2board(Y_pts)`}</Python>
    <strong>Task 5.12.8:</strong> Finally, display the result of
    <Python>image_mat_util.mat2display(Y_board, colors, ('y1', 'y2', 'y3'), scale=100, xmin=None, ymin=None)</Python>
    <Image src={board_transformed} style={{ maxWidth: 700 }} alt="Whiteboard with writing, taken from a skewed angle" />
    <strong>Original image:</strong>
    <Image
      src={board}
      style={{ maxWidth: 600 }}
      alt="Whiteboard with writing, transformed to make the board a rectangle"
    />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_6/chapter_6.ipynb">
        Chapter 6
      </Link>
    </h3>
    <p>
      <strong>Problem 6.7.12:</strong> Write and test a procedure <code>is_invertible(M)</code> with the following spec:
    </p>
    <ul>
      <li>
        {' '}
        <i>input:</i> an instance <code>M</code> of <code>Mat</code>
      </li>
      <li>
        {' '}
        _output: <code>True</code> if <code>M</code> is an invertible matrix, <code>False</code> otherwise
      </li>
    </ul>
    <p>
      Your procedure should not use any loops or comprehensions. It can use procedures from the <code>matutil</code>{' '}
      module and from the <code>independence</code> module.
    </p>
    <p>Test your procedure with the following examples:</p>
    <p>Over {`$\\mathbb{R}$`}:</p>
    <p>
      {`$\\begin{bmatrix}1 &2 &3\\\\3 &1 &1\\end{bmatrix}$: False $\\begin{bmatrix}1 &0 &1 &0\\\\0 &2 &1 &0\\\\0 &0 &3 &1\\\\0 &0 &0 &4\\end{bmatrix}$: True $\\begin{bmatrix}1 &0\\\\0 &1\\\\2 &1\\end{bmatrix}$: False $\\begin{bmatrix}1 &0\\\\0 &1\\end{bmatrix}$: True $\\begin{bmatrix}1 &0 &1\\\\0 &1 &1\\\\1 &1 &0\\end{bmatrix}$: True`}
    </p>
    <p>Over $GF(2)$:</p>
    <p>
      {`$\\begin{bmatrix}one &0 &one\\\\0 &one &one\\\\one &one &0\\end{bmatrix}$: False $\\begin{bmatrix}one &one\\\\0 &one\\end{bmatrix}$`}
      : True
    </p>
    Note the resemblance between two matrices, one over {`$\\mathbb{R}$`} and one over $GF(2)$, and note that one is
    invertible and the other is not.
    <Python>{`from matutil import mat2coldict
from matutil import listlist2mat

def is_invertible(M):
    return M.is_square() and my_is_independent(list(mat2coldict(M).values()))

is_invertible(listlist2mat([[1,2,3],[3,1,1]]))
> False

is_invertible(listlist2mat([[1,0,1,0],[0,2,1,0],[0,0,3,1],[0,0,0,4]]))
> True

is_invertible(listlist2mat([[1,0],[0,1],[2,1]]))
> False`}</Python>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_7/chapter_7_labs.ipynb">
        Chapter 7
      </Link>
    </h3>
    <p>
      <strong>Task 7.8.11:</strong> Let $N = 2461799993978700679$, and try to factor $N$
    </p>
    <ul>
      <li>
        {' '}
        Let <code>primelist</code> be the set of primes up to 10,000.{' '}
      </li>
      <li>
        {' '}
        Use <code>find_candidates(N, primelist)</code> to compute the lists <code>roots</code> and <code>rowlist</code>.{' '}
      </li>
      <li>
        {' '}
        Use <code>echelon.transformation_rows(rowlist)</code> to get a matrix <code>M</code>.{' '}
      </li>
      <li>
        {' '}
        Let <code>v</code> be the last row of <code>M</code>, and find <code>a</code> and <code>b</code> using{' '}
        <code>find_a_and_b(v, roots, N)</code>.{' '}
      </li>
      <li>
        {' '}
        See if <code>a - b</code> has a nontrivial common divisor with <code>N</code>. If not, repeat with{' '}
        <code>v</code> being the second-to-last row of <code>M</code> or the third-to-last row...{' '}
      </li>
    </ul>
    <p>Give a nontirvial divisor of $N$.</p>
    <Python>{`def factor(N):
    primelist = primes(10_000)
    roots, rowlist = find_candidates(N, primelist)
    M = transformation_rows(rowlist, sorted(primelist, reverse=True))
    for v in reversed(M):
        a, b = find_a_and_b(v, roots, N)
        divisor = gcd(a - b, N)
        if divisor != 1 and divisor != N:
            return divisor

N=2461799993978700679
factor(N)
> 1230926561`}</Python>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_8/chapter_8.ipynb">
        Chapter 8
      </Link>
    </h3>
    <p>
      <strong>Task 8.4.10:</strong> Write a procedure <code>gradient_descent_step(A, b, w, sigma)</code> that, given the
      training data $A$, {`$\\boldsymbol{b}$`} and the current hypothesis vector {`$\\boldsymbol{w}$`}, returns the next
      hypothesis vector.
    </p>
    <p>
      The next hypothesis vector is obtained by computing the gradient, multiplying the gradient by the step size, and
      subtracting the result from the current hypothesis vector.
    </p>
    <Python>{`def gradient_descent_step(A, b, w, sigma):
    return w - sigma * find_grad(A, b, w)`}</Python>
    <p>
      <strong>Task 8.4.11:</strong> Write a procedure <code>gradient_descent(A, b, w, sigma, T)</code> that takes as
      input the training data $A$, {`$\\boldsymbol{b}$`}, and initial value {`$\\boldsymbol{w}$`} for the hypothesis
      vector, a step size $\sigma$, and a number $T$ of iterations. The procedure should implement gradient descent as
      described above for $T$ iterations, and return the final value of {`$\\boldsymbol{w}$`}.
    </p>
    <p>
      Every thirty iterations or so, the procedure should print out the value of the loss function and the fraction
      wrong for the current hypothesis vector.
    </p>
    <Python>{`def gradient_descent(A, b, w, sigma, T):
    for i in range(T):
        if i % 30 == 0:
            print('Loss:\\t', loss(A, b, w))
            print('Fraction wrong:\\t', fraction_wrong(A, b, w))
        w = gradient_descent_step(A, b, w, sigma)
    return w`}</Python>
    <p>
      <strong>Task 8.4.12:</strong> Try out your gradient descent code on the training data! Notice that the fraction
      wrong might go up even while the value of the loss function goes down. Eventually, as the value of the loss
      function continues to decrease, the fraction wrong should also decrease (up to a point).
    </p>
    <p>Try a step size of {`$\\sigma = 10^{-9}$`}.</p>
    <Python>{`w = Vec(A.D[1], {k: 1 for k in A.D[1]})
sigma = 1e-9 # sigma too large
T = 300
gradient_descent(A, b, w, sigma, T)

Loss:\t 1461169191.1916513
Fraction wrong:\t 0.5133333333333333
Loss:\t 1867476.164994827
Fraction wrong:\t 0.73
Loss:\t 1501858.2431936574
Fraction wrong:\t 0.7133333333333334
Loss:\t 1261341.0368251363
Fraction wrong:\t 0.7133333333333334
Loss:\t 1099845.1036712618
Fraction wrong:\t 0.7166666666666667
Loss:\t 988408.6940531735
Fraction wrong:\t 0.7133333333333334
Loss:\t 908821.9038339362
Fraction wrong:\t 0.71
Loss:\t 849628.557730042
Fraction wrong:\t 0.7166666666666667
Loss:\t 803615.1441978435
Fraction wrong:\t 0.7033333333333334
Loss:\t 766233.6931558683
Fraction wrong:\t 0.7066666666666667`}</Python>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_9/chapter_9.ipynb">
        Chapter 9
      </Link>
    </h3>
    <p>
      <strong>Problem 9.11.9:</strong> Write a module <code>orthonormalization</code> that defines a procedure{' '}
      <code>orthonormalize(L)</code> with the following spec:
    </p>
    <ul>
      <li>
        {' '}
        <i>input:</i> a list <code>L</code> of linearly independent <code>Vec</code>s
      </li>
      <li>
        {' '}
        <i>output:</i> a list <code>Lstar</code> of <code>len(L)</code> orthonormal <code>Vec</code>s such that, for{' '}
        <code>i = 1, ..., len(L)</code>, the first <code>i</code> <code>Vec</code>s of <code>Lstar</code> and the first{' '}
        <code>i</code> <code>Vec</code>s of <code>L</code> span the same space.
      </li>
    </ul>
    <p>Your procedure should follow this outline:</p>
    <ol>
      <li>
        {' '}
        Call <code>orthogonalize(L)</code>
      </li>
      <li> Compute the list of norms of the resulting vectors, and</li>
      <li> Return the list resulting from normalizing each of the vectors resulting from Step 1.</li>
    </ol>
    <Python>{`def orthonormalize(L):
    Lstar_not_normalized = orthogonalize(L)
    norms = [(Lstar_i * Lstar_i)**0.5 for Lstar_i in Lstar_not_normalized]
    return [Lstar_i / norm for Lstar_i, norm in zip(Lstar_not_normalized, norms)]

orthonormalize([list2vec([4,3,1,2]), list2vec([8,9,-5,-5]), list2vec([10,1,-1,5])])
> [Vec({0, 1, 2, 3},{0: 0.7302967433402214, 1: 0.5477225575051661, 2: 0.18257418583505536, 3: 0.3651483716701107}),
 Vec({0, 1, 2, 3},{0: 0.1867707814860146, 1: 0.4027244975792189, 2: -0.5661489313794816, 3: -0.6945538436511166}),
 Vec({0, 1, 2, 3},{0: 0.5275409009423367, 1: -0.6531216993058959, 2: -0.5123087286340884, 3: 0.18075511139121447})]`}</Python>
    <p>
      <strong>Problem 9.11.10:</strong> Write a procedure <code>aug_orthonormalize(L</code> in your{' '}
      <code>orthonormalization</code> module with the following spec:
    </p>
    <ul>
      <li>
        {' '}
        <i>input:</i> a list <code>L</code> of <code>Vec</code>s
      </li>
      <li>
        {' '}
        <i>output:</i> a pair <code>Qlist, Rlist</code> of lists of <code>Vec</code>s such that
        <ul>
          <li>
            {' '}
            <code>coldict2mat(L)</code> equals <code>coldict2mat(Qlist)</code> times <code>coldict2mat(Rlist)</code>,
            and
          </li>
          <li>
            {' '}
            <code>Qlist = orthonormalize(L)</code>
          </li>
        </ul>
      </li>
    </ul>
    <Python>{`from vec import Vec
from orthogonalization import aug_orthogonalize
from matutil import mat2coldict

def aug_orthonormalize(L):
    Qlist = orthonormalize(L)
    Q = coldict2mat(Qlist).transpose()
    R = Q * coldict2mat(L)
    Rlist = list(mat2coldict(R).values())
    return Qlist, Rlist
    
from matutil import coldict2mat

L = [list2vec(v) for v in [[4,3,1,2],[8,9,-5,-5],[10,1,-1,5]]]
Qlist, Rlist = aug_orthonormalize(L)
print(coldict2mat(Qlist))

           0      1      2
     ---------------------
 0  |   0.73  0.187  0.528
 1  |  0.548  0.403 -0.653
 2  |  0.183 -0.566 -0.512
 3  |  0.365 -0.695  0.181

print(coldict2mat(Rlist))

               0        1      2
     ---------------------------
 0  |       5.48     8.03   9.49
 1  |   2.22E-16     11.4 -0.636
 2  |  -2.22E-16 4.44E-16   6.04
print(coldict2mat(Qlist) * coldict2mat(Rlist))

       0  1  2
     ---------
 0  |  4  8 10
 1  |  3  9  1
 2  |  1 -5 -1
 3  |  2 -5  5`}</Python>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_10/chapter_10.ipynb">
        Chapter 10
      </Link>
    </h3>
    <p>
      <strong>Task 10.9.18:</strong> Finally, use <code>suppress2d(D_dict, threshold)</code> and{' '}
      <code>sparsity2d(D_dict)</code> to come up with a threshold that achieves the degree of compression you would
      like. Apply the backward transform and round the result using <code>image_round</code>, and then view it to see
      how close it is to the original image.
    </p>
    <Python>{`compressed = suppress2d(transformed, 20)
print('Compression rate: ', str(sparsity2d(compressed) * 100) + ' percent of original size')
positions, colors = image2mat(image_round(backward2d(compressed)))
mat2display(positions, colors)

Compression rate:  14.00299072265625 percent of original size`}</Python>
    <Image src={dali_compressed} style={{ maxWidth: 400 }} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_11/chapter_11.ipynb">
        Chapter 11
      </Link>
    </h3>
    <p>
      <strong>Task 11.6.7:</strong> We will use the <code>distance_squared</code> procedure to classify images. First
      let's consider the images we already know to be faces. Compute the list consisting of their distances from the
      subspace of chosen eigenfaces (remember to work with the centered image vectors). Why are these distances not
      zero?
    </p>
    <Python>{`# based on wording of later questions, I'm actually going to compute the _squared_ distances from the subspace
centered_face_distances_squared = [distance_squared(V_10.transpose(), centered_face_images[i]) for i in range(len(centered_face_images))]`}</Python>
    <p>
      <strong>Task 11.6.8:</strong> Next, for each unclassified image vector, center the vector by subtracting the
      average face vector, and find the squared distance of the centered image vector from the subspace of eigenfaces
      you found in Problem 11.6.3. Based on the distances you found, estimate which images are faces and which are not.
    </p>
    <Python>{`unclassified_images = {i: image2vec(color2gray(file2image("unclassified/img%02d.png" % i))) for i in range(10)}
centered_unclassified_images = {i: unclassified_images[i] - a for i in range(len(unclassified_images))}
centered_unclassified_distances_squared = [distance_squared(V_10.transpose(), centered_unclassified_images[i]) for i in range(len(centered_unclassified_images))]

# Let's use as a threshold 2.5X the _max_ of the known squared face-vector distances. (I got this from trying a few different values.)
threshold_distance_squared = max(centered_face_distances_squared) * 2.5

is_face_estimate_mask = [distance_squared < threshold_distance_squared for distance_squared in centered_unclassified_distances_squared]`}</Python>
    <p>
      <strong>Task 11.6.9:</strong> Display each of the unclassified images to check your estimate. Are the squared
      distances of non-faces indeed greater than those for faces? What is the single threshold value you would choose to
      decide if a given image is a face or not?
    </p>
    <div style={{ display: 'flex' }}>
      <div style={{ margin: 'auto' }}>Predicted as face</div>
      <div style={{ margin: 'auto' }}>Predicted as not-a-face</div>
    </div>
    <div style={{ display: 'flex' }}>
      <div style={{ margin: 'auto' }}>
        <img src={face_1} alt="face" />
      </div>
      <div style={{ margin: 'auto' }}>
        <img src={nonface_1} alt="not a face" />
      </div>
    </div>
    <div style={{ display: 'flex' }}>
      <div style={{ margin: 'auto' }}>
        <img src={face_2} alt="face" />
      </div>
      <div style={{ margin: 'auto' }}>
        <img src={nonface_2} alt="not a face" />
      </div>
    </div>
    <div style={{ display: 'flex' }}>
      <div style={{ margin: 'auto' }}>
        <img src={face_3} alt="face" />
      </div>
      <div style={{ margin: 'auto' }}>
        <img src={nonface_3} alt="not a face" />
      </div>
    </div>
    <div style={{ display: 'flex' }}>
      <div style={{ margin: 'auto' }}>
        <img src={face_4} alt="face" />
      </div>
      <div style={{ margin: 'auto' }}>
        <img src={nonface_4} alt="not a face" />
      </div>
    </div>
    <div style={{ display: 'flex' }}>
      <div style={{ margin: 'auto' }}>
        <img src={face_5} alt="face" />
      </div>
      <div style={{ margin: 'auto' }}>
        <img src={nonface_5} alt="not a face" />
      </div>
    </div>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/coding_the_matrix/chapter_12/chapter_12.ipynb">
        Chapter 12
      </Link>
    </h3>
    <p>
      <strong>Task 12.12.5:</strong> Write a procedure <code>wikigoogle</code> with the following spec:
    </p>
    <ul>
      <li>
        {' '}
        <i>input:</i>
        <ul>
          <li>
            {' '}
            A single word <code>w</code>
          </li>
          <li>
            {' '}
            The number <code>k</code> of desired results
          </li>
          <li>
            {' '}
            The pagerank eigenvector <code>p</code>
          </li>
        </ul>
      </li>
      <li>
        {' '}
        <i>output:</i> a list of the names of the <code>k</code> highest-pagerank wikipedia articles containing that
        word.
      </li>
    </ul>
    <Python>{`from pagerank import read_data, find_word

links = read_data()

Reading word meta-index
Reading titles
Reading link structure
..................................................................................
Done`}</Python>
    <Python>{`def wikigoogle(w, k, p):
    related = find_word(w)
    related.sort(key=lambda x: p[x], reverse=True)
    return related[:k]`}</Python>
    <p>
      <strong>Task 12.12.6</strong> Use <code>power_method</code> to compute the pagerank eigenvector for the wikipedia
      corpus and try some queries to see the titles of the top few pages: "jordan", "obama", "tiger" and of course
      "matrix". What do you get for your top few articles? Can you explain why? Are the top ranked results more relevant
      or important in some sense than, say, the first few articles returned by <code>find_word</code> without ranking?
    </p>
    <Python>{`from mat import Mat

A1 = make_Markov(links)
A2 = Mat(A1.D, {k:1/len(A1.D[0]) for k in A1.f.keys()})
A = 0.85*A1 + 0.15*A2

p = power_method(A, 6)

jordan_results = wikigoogle('jordan', 5, p)
obama_results  = wikigoogle('obama', 5, p)
tiger_results  = wikigoogle('tiger', 5, p)
matrix_results = wikigoogle('matrix', 5, p)

jordan_results
> ['2007', '2006', '2005', 'paris', 'israel']

obama_results
> ['united states',
 'president of the united states',
 'chicago',
 'democratic party (united states)',
 'illinois']`}</Python>
    <div id="aside_1">
      <p>
        <small>
          <sup>1</sup> There is also a{' '}
          <Link href="http://www.math.brown.edu/~treil/papers/LADW/LADW.html">
            <i>Linear Algebra Done Wrong</i>
          </Link>{' '}
          book whose name nudges good-naturedly at the aforementioned <i>"Done Right"</i>.
        </small>
      </p>
    </div>
    <div id="aside_2">
      <p>
        <small>
          <sup>2</sup> I remember determinants feeling unmotivated in my first class on linear algebra in college.
          However,{' '}
          <Link href="https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab">
            3Blue1Brown's linear algebra series
          </Link>
          takes what might be considered a fourth path to understanding linear algebra, which could be called the
          "geometric intuition" path. From this vantage point, determinants are the conceptual glue between projection,
          inversion, change-of-basis and eigenvalues.
        </small>
      </p>
    </div>
  </div>
)
