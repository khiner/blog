import React from 'react'
import Link from '../Link'

export default (
  <div>
    <h2>I released an Android app!</h2>
    <p>
      Woo! I'm happy to get this sucker out the door. I've worked on it off and
      on <small>(mostly off)</small> for a super long time. I picked it up again
      and put a lot of work into it the last few weeks, fixing bugs and making
      improvements. I'm happy to say it's in pretty darn good shape now! It
      feels like a stable app, it does what it was designed to do, and I dare
      say it's fun!
    </p>
    <p>
      <Link href="https://play.google.com/store/apps/details?id=com.odang.beatbot_android">
        Here is the Play Store link
      </Link>
      . If you have an Android device, please do check it out and share what you
      make!
    </p>
    <h2>Overview</h2>
    <p>
      BeatBot is an intuitive and flexible beat production environment. It
      provides the essential sound design tools for rich sample-based beat
      production. Its interface is designed to take full advantage of the
      expressive capability of multitouch interaction on a mobile form factor.
    </p>
    <p>
      BeatBot aims to be simple and intuitive so you can express your ideas
      quickly, but also flexible and powerful enough to refine sketches into
      full productions.
    </p>
    <h2>Demo & tutorial video</h2>
    <div className="videoWrapper">
      <iframe
        title="BeatBot Demo"
        src="https://www.youtube.com/embed/XX6qeg30LSo"
        scrolling="no"
        frameBorder="0"
      />
    </div>

    <h2>Story time</h2>
    <p>
      <big>I started making this app six years ago, back in early 2012.</big> I
      was in school for my CS degree at PSU, and was about halfway through my
      first internship at Jive Software. I was in that wonderful honeymoon
      period where I just wanted to code <i>all the time</i>. I still get that
      way in bursts, when I get sucked into something and it's all I want to do.
      But back then I remember getting so much satisfaction-juice in my brain
      just from the act of coding itself.
    </p>
    <p>
      <big>The original idea for the app</big> was to translate beatboxing into
      drum machine beats by listening to someone beatbox through the microphone,
      categorizing the sounds into drums (kick, snare, hi-hat, etc), and
      generating a drum pattern live... <i>but the app does not do this.</i> It
      does a whole bunch of other things! But it does not do the only thing I
      originally wanted to make it do.
    </p>
    <h2>A case study in feature creep</h2>
    <p>
      <big>How did this happen?</big> Well, to translate beatboxing into drum
      samples live, I wanted a visual reference for where you were in the
      recording loop. At the very least, something to look at for visual
      feedback that the app has some idea of what's going on.
    </p>
    <p>
      I also wanted to provide a way to correct the app's mistakes by editing
      the categorized notes and their timing. Having the notes quantized wrongly
      by an app because they weren't <i>exactly</i> on beat, with no way to make
      modifications, would be a frustrating experience. The app also needed a
      play and stop button at the very least. It's also kinda lame if you can't
      even change the default samples the app chooses for you. And now that you
      can do that, it feels weird to not even be able to adjust the volume of
      the tracks, and super basic stuff like pitch and pan.
    </p>
    <p>
      Now that I had already implemented all this MIDI stuff to track note start
      and stop events over time, it only made sense to allow the user to export
      the pattern. This would turn the app into something more like a real tool
      than a novelty, since you could export patterns to another app like
      Ableton to actually finish things. It could be incorporated into a real
      musician's workflow, perhaps.
    </p>
    <p>
      And now that the app does all this and it's taken me so long, do I really
      have time to add this beatboxing categorization feature? In fact, it would
      feel kind of clunky. People aren't used to this idea and it might just be
      a distraction from actually making jams, which is now what this app is all
      about!
    </p>
    <p>
      You get it. Maybe you've done it, too. There's a reason feature creep or
      scope creep has a name - it's pretty common.
    </p>
    <h2>How did I lose control of my app?</h2>
    <p>
      <big>
        Okay, but how did this <i>really</i> happen?
      </big>{' '}
      What were the causal elements leading to my app getting out of hand? It's
      not that I feel it was a mistake, but if I knew back then how much time
      and energy it would take - that it would turn into a complex DAW instead
      of this fun idea I had, and that I wouldn't actually be using it to make
      music since I've never regularly used an Android phone in my life (I
      bought one on Craigslist to make the app) - I think my time could have
      been more well spent. I dunno, maybe the auxiliary learning and experience
      benefits justify all the cost, and I <i>am</i> really happy with the
      results. But there came a time when it kind of developed a mind of its own
      and I want to understand how.
    </p>
    <h3>I wasn't solving my own problem</h3>
    <blockquote>
      The way to get startup ideas is not to try to think of startup ideas. It's
      to look for problems, preferably problems you have yourself.
      <br />- Paul Graham
    </blockquote>

    <p>
      From a business perspective, it seems obvious why this advice is crucial.
      After all, if I'm not even solving a problem of my own, how can I expect
      I'm solving anyone else's?
    </p>
    <img
      src="https://78.media.tumblr.com/ce2931a48b27e3b7b8ccc37de66df197/tumblr_mved1iKomo1qlvwnco1_r1_400.gif"
      alt="RuPaul"
      style={{ width: '50%' }}
    />
    <p>
      From a product development perspective, once I stopped building something
      I actually wanted to use <i>often</i> and <i>instead</i> of other
      products, I began to lose touch. I lost pragmatism. There's no way to
      evaluate a solution without a problem to match, so there is nothing to do
      but build toward other solutions that already exist. This may have been
      appropriate to some degree in my case, since part of my goal was to gain
      experience in the mobile and audio domains for learning purposes. But I
      wasn't clear with myself about setting or moving that goalpost. I hadn't
      paused to adapt my expectations. I still thought I was building something,
      at least in part, for other people and not just for my own education.
    </p>
    <p>
      I started playing whack-a-mole trying to gain parity with existing
      products I used and loved. Without a way to evaluate if I was done except
      going by feel and by comparison, the only way forward was blindly
      executing, feature by feature. There was no sense of true innovation
      driving me forward because I was only innovating at the surface level,
      making minor improvements. At the end, I think there were enough minor
      improvements over other products to justify its existence in the market.
      But if I knew from the start I'd be building something so similar to other
      things out there, I may have chosen a more specialized problem early on.
      At the very least I would have adapted my expectations and goals toward
      self-education alone. In fact, I have a future project in mind that will
      be an almost exact replica of an existing tool. It's a great learning
      exercise, like making a cover song.
    </p>

    <h3>I was trying to recoup sunken costs.</h3>
    <p>
      The sunken cost fallacy is a popular idea in behavioral economics. You
      probably know about it. It happens when you put more resources into
      something to justify having already invested more resources than you
      should have. The more emotional investment you have in something, the
      harder it is to abandon it. I fall victim to this <i>all the time</i>.
      I've done it with investing and gambling{' '}
      <small>
        (ugh, I just lost money. I feel bad and dumb. But if I invest more
        money, recoup the losses and even make a profit, I'll feel good and
        smart again!)
      </small>
      , and I did it with this app.
    </p>

    <h3>I chose a domain with high essential complexity.</h3>
    <p>
      <i>Accidental</i> complexity is the type that doesn't strictly need to
      exist to solve the problem at hand. We can work to identify when we're
      introducing accidental complexity by always critically asking ourselves if
      we're working on the most important thing, and by favoring simplicity over
      complexity in design and software architecture.
    </p>
    <p>
      Some domains, however, are just plain complex (or in fancy language,{' '}
      <i>essentially</i> complex). If you're building an online banking
      platform, there's no way around interfacing with the complexities of
      financial institutions, security, legalese, concurrency and strong program
      correctness guarantees.
    </p>
    <p>
      Digital audio workstations, I've learned, are another example of this. I
      didn't overdo it with the features in BeatBot - any mobile DAW should have
      at least 90% of the features it has, and most have many more. Users will
      not feel a sense that the app is complete unless it checks off a sizeable
      number of boxes, since big companies have made us accustomed to an array
      of wonderfully powerful (and essentially complex) features in audio
      production. Without providing these features, I wouldn't be helping
      people. I'd just be burdening them with more app choices to sift through.
      They'd be better off with another tool developed by a large company with
      resources to devote.
    </p>
    <h3>I worked for the sake of working.</h3>
    <p>
      I really liked the problem I was working on. I got joy simply from the act
      of working on it, so it was difficult to stop. Actively working on
      something is pleasantly straightforward and rewarding. I know what to work
      on the next time sit down (
      <Link href="https://image.slidesharecdn.com/hemingway-141105082003-conversion-gate01/95/5-writing-tips-by-ernest-hemingway-3-638.jpg">
        following Hemingway's advice
      </Link>
      ). I'm past the boring tedious parts, like writing boilerplate and setting
      up my development environment, so I have quick access to flow state
      whenever I pick up a task. I'm checking things off the list. Life is good.
      This all goes away briefly when you stop and start another thing.
    </p>
    <p>
      Also, at least for me, working on a project is so much more rewarding than
      releasing it. Ending something is difficult in part because you're ending
      a part of your life and entering the unknown. Director Paul Thomas
      Anderson puts it well in{' '}
      <Link href="https://youtu.be/PGB8UtHtZWI?t=50s">this interview</Link>,
    </p>
    <blockquote>
      Cashing the silver in and finding out what it's worth never really ends up
      being as satisfying, or as fun, as it was to be down in that hole... I was
      completely unprepared for the depression and the melancholy that comes
      from finishing something.
    </blockquote>
    <p>
      I don't really relate to the melancholy in this case. That's probably
      because I know what's cooking next, but I can really see what he means.
      The bigger the project and the more unknown the future, the more difficult
      the finishing transition will be, I think.
    </p>
    <h3>I was being a perfectionist.</h3>
    <p>
      There is another wonderful thing about not being finished with something:
      it's all yours. It's not ready to be seen or used yet. Creative artifacts
      originally find existence via projection into the future as a model in the
      creator's imagination. The creation plods slowly toward the present, still
      imbued with the feathered edges of its metaphysical beginnings. Until it
      is petrified into our collective present, it can still have at least a toe
      in that achromatic future time, a small part of it unencumbered with the
      sharp and heavy trappings of our explicit now. Soon it will be an exact
      likeness of its glittering future self, but not quite yet...
    </p>
    <h3>I was trying to make something I'd be proud of.</h3>
    <p>
      In the absence of a real, specific problem to solve, my goal, I think,
      really became to make something I would be proud of - a portfolio piece.
      The problem here is that fulfilling pride is a task whose completion is
      not empirically measurable. When we make something representative of a
      personal sense of achievement, the acceptance criteria for completion
      depends only on how much achievement one seeks to feel. Not only is this
      criterion different for everybody, but even for a single individual it is
      moving goalpost. How much one has to prove to the world changes based on
      life circumstance.
    </p>
    <h3>I backpedalled wildly with the app's architecture.</h3>
    <p>
      Some false starts and blind alleys are unavoidable when you take on a
      substantial task. Something will feel like a good-enough approach and will
      later be invalidated by sheer complexity, requiring generalization or
      restructuring. Some of these situations, however, are completely avoidable
      with good old fashioned planning.
    </p>
    <p>
      In the case of BeatBot, this blind alley was the UI. I ended up needing to
      completely ditch Android's built-in view library - their buttons, widgets,
      scrollable views, text fields, etc. - in favor of building my own view
      library from scratch in OpenGL. There were several OpenGL components in
      the app right from the start - obviously the note editing grid, the notes
      themselves, etc., needed to be drawn with a library capable of rendering
      arbitrary lines and polygons. Also things like the 1D and 2D sliders used
      for volume, pitch and pan levels, as well as effect params and such,
      looked similar to how they do now. But they were treated as separate
      OpenGL components within a standard Android view frame. In practice, this
      meant when changing pages there would be ugly black rectangles cut into
      the background as the OpenGL components were loaded. I continued on this
      way for a long time before reimplementing <i>everything</i> in OpenGL.
      Saving this till late in the game and cost me <i>a ton</i> of time.
    </p>
    <h3>I lost perspective.</h3>
    <p>
      When I work on something, all the gears start turning forward. I feel the
      need to make consistent forward progress on something whenever I sit down.
      I will forsake planning almost completely, since it doesn't immediately
      produce tactile results. This might sound like a humblebrag. But hold on,
      it gets real.
    </p>
    <p>
      This tendency goes deeper than just productivity. It comes from a
      permeating sense of impatience that takes control of all my actions. I get
      impatient with all sorts of things in life. I also have an impulsive
      disposition. This sometimes-unfortunate cocktail results in my natural
      working state: 1) decide to work on something, 2) grab the first piece of
      it that comes to mind, 3) start working on it, and 4) compulsively
      continue working on it until it's either done or I run into a brick wall.
      The "Sunken costs" aspect above is a huge part of this.
      <br />
      <i>"I've already started, so I may as well finish."</i>
      <br />
      <i>
        "I'm so close to finishing, I'd have wasted all this time if I don't
        have something concrete to show for it soon."
      </i>
      <br />
      <i>
        "Okay, it's now clear this isn't the best way, but stepping backwards at
        this point isn't worth the time."
      </i>
      <br />
      <br />
      In my professional life this has been a serious issue to grapple with.
      I've gotten feedback from two of my managers on my propensity to just push
      forward on tasks without foreseeing some future consequence of a technical
      decision. I've made huge progress, but it's still really ingrained and
      takes concerted effort to recognize and manage.
    </p>

    <h2>What I'm doing differently in the future</h2>
    <p>
      I don't think there's anything wrong with the outcome of this app. I've
      learned that the payoff for hard work can come in many forms other than
      the finished product itself. In this case, I don't think I would have
      landed my great gig at New Relic for the last 4.5 years without having
      this to talk about in depth over coffee with my manager-to-be. There is
      also the hard-to-quantify general skill development, especially in
      software architecture. Working on and maintaining a complex codebase over
      a long period of time has been essential to my growth as a developer.
    </p>
    <p>
      That said, there are many aspects to how I worked on this app that I don't
      want to replicate in any future project. Here's what I'm going try to do
      differently next time:
    </p>
    <ul>
      <li>
        <b>Solve my own problem.</b>
        <br />
        As discussed above. This should also help keep me motivated and
        interested. Using one's own tool is the best way to know whether it's
        better than any alternative in the market. In the future, if I find I'm
        not regularly using the thing I'm building, I'm going to take a
        reflective pause.
      </li>
      <br />
      <li>
        <b>Plan. Then plan more.</b>
        <br />
        Planning more than pays for itself. Planning is a real work product.
        This is going to be my mantra. Deep down I still don't really believe
        it's true even though I've heard it a hundred times, even though I've
        experienced its payoff, and even though I've experienced the
        consequences of its absence so many times.
      </li>
      <br />
      <li>
        <b>Build incrementally.</b>
        <br />
        This is another thing I've already "known" for a long time, but needed
        to fail at first before really internalizing it. It's also a skill that
        takes a lot of practice to get good at. Developing a big project in a
        way that produces meaningful and cohesive intermediate results is not
        something that happens naturally. It can require extensive planning. In
        fact, a list of these intermediate results could be <i>the</i> work
        artifact produced during the planning stage(s).
      </li>
      <br />
      <li>
        <b>Share early, share often.</b>
        <br />
        It can be so tempting to go into stealth mode and emerge months or years
        later from the darkness and blow everyone's mind. For things like art
        projects where the main goal is self expression, I think this is a great
        approach. Its main benefit is that it allows complete control over every
        aspect of the final product until one's own satisfaction is achieved.{' '}
        <i>Dark Side of the Moon</i> wouldn't have sold 45 million copies if it
        was released a track at a time over two years.
        <br />
        <br />
        In software, on the other hand, sharing progress throughout its
        development has many advantages. It enforces the above point of building
        incrementally, since sharing intermediate results requires that they be
        cohesive and meaningful enough to explain independently, and in the
        context of their relevance toward broader goals. If you can't explain to
        subscribers (even imagined subscribers!) why they should care, it can be
        an invaluable early warning signal to reconsider the current heading.
        <br />
        <br />
        Sharing can also inject mental energy by providing a sense of completion
        and closure at multiple stages, instead of continually pushing toward
        ONE MAJOR THING to nail.
      </li>
      <br />
      <li>
        <b>Diversify work.</b>
        <br />
        My natural state is to zone in almost exclusively on one thing for a
        chunk of time. When I'm done with that thing, or when I get burnt out on
        it, I switch to another thing and focus on only that. This is part of
        what leads to the "Losing perspective" problem described above. Working
        on multiple things simultaneously is one way to enforce taking a real
        mental break from a problem. Taking a break gives the mind natural space
        to do its thing and kind of ambiently work on a problem at different
        levels. For me at least, I've found that time away from a problem is the
        surest path to gaining the kind of real perspective needed to make good
        decisions about higher-level things like adapting priorities, narrowing
        scope, or even scrapping an idea or a large piece of it entirely. This
        leads me to:
      </li>
      <br />
      <li>
        <b>Consider not doing anything.</b>
        <br />
        When facing a problem or thinking about a potential task, I've recently
        gotten in the habit of asking myself, "What if I just didn't do
        anything?" It's amazing how often the answer can be, "Not much!" One
        aspect of this is just prioritization - the problem at hand might not
        actually be the most important thing to be working on. Another aspect is
        finding the root cause of the problem. We think we <i>need</i> the
        immediate problem solved, and we jump to the obvious solution. But after
        asking <Link href="https://en.wikipedia.org/wiki/5_Whys">5 Whys</Link>{' '}
        about the problem, one often finds that the <i>real</i> problem is
        actually very different than the surface-level one that smacked us in
        the face. The thing we were focused on is actually an <i>effect</i> of a
        problem several layers down, and the real solution to the problem may
        not require any coding or even touching a computer. Maybe the solution
        is documentation, or linking to another library. Maybe a deeper
        understanding of the problem is needed and it's time to hit the books.
        Maybe a change of focus is needed, or the whole thing should be
        scrapped. Maybe I'm just hungry or haven't gotten enough sleep, or need
        a beer with a friend.
      </li>
      <br />
      <li>
        <b>Don't develop for Android.</b>
        <br />
        It's hard for me to think of nice things to say about Android as a
        developer. Especially if you're working close to the metal with native
        code. Handling different CPU architectures, OS versions, different
        OpenGL & OpenSL versions and APIs, different screen sizes and
        resolutions, hardware buttons or no hardware buttons. It's a total mess,
        and things are in general not made easy for developers. There is a lot
        of writing on this topic. If I were to develop for mobile again, I would
        make a native iOS app, or use React Native for cross-platform. Android
        bad. My opinion. Nuff said.
      </li>
      <br />
      <li>
        <b>Distrust 3rd party libraries, and especially platforms, deeply.</b>
        <br />
        The usual advice is to not build something yourself if you don't have
        to.{' '}
        <i>
          "Most problems have been solved a hundred times already by people
          smarter and more dedicated than you. Use their publicly available
          solutions instead of reinventing the wheel."
        </i>{' '}
        This is usually great advice, and sounds like a truism - instead of
        spending weeks building something, instead spend hours learning what you
        need to interface with an existing solution. <br />
        <br />
        However, there are a couple good reasons not to heed this advice. First
        off, this advice is optimizing for speed of development. If your main
        goal or a subgoal is <i>learning</i>, it may be wise to build it from
        scratch to see how things work under the hood. This is usually my
        justification when I build things from scratch.
        <br />
        <br />
        Another obvious time to build it yourself is when there is no third
        party solution available. The interesting case is when it <i>
          looks
        </i>{' '}
        like a library will meet your needs, but in fact it only meets some of
        them - maybe even all of them at the current time - but not all future
        needs in the domain. Later you'll be trying to build on, extend or
        otherwise stretch the library to its limits. At a certain point, this
        framework may become a foundational part of your product. Now you're
        reimplementing bits of it, sidestepping it for certain edge cases, and
        cobbling together an awkward interface with no extensibility. The same
        amount of time could have been invested into understanding the problem
        space deeply and designing an extensible solution that fit your needs
        exactly.
        <br />
        <br />
        "Rolling your own", like "premature optimization", is a phrase used
        disparagingly and advised against dogmatically. For ancillary tasks,
        there's no doubt that a library is usually the way to go. Frameworks or
        libraries that are related to the <i>core competency of your product</i>
        , on the other hand, deserve a deeply skeptical evalutation with an eye
        toward the long-term future of your project's development.
        <br />
      </li>
      <br />
      <li>
        <b>Practice mindful emotional investment.</b>
        <p>
          The more emotional investment we have in something, the more likely
          irrational factors like sunken costs will feed into our decision
          making with regard to how we spend our time and energy. It also
          becomes harder to be impartial to feedback and criticism.
        </p>
        <p>
          It is natural for creative ventures to become intertwined with our
          sense of identity. Our creations are an extension of ourselves, and a
          sense of ownership and pride can be positive motivations for creators.
          A challenge is then to translate this personal connection to our work
          into a sense of ownership and passion, while not going so far as to
          equate professional or creative success with our sense of self worth.
        </p>
        <p>
          When I've successfully made this distinction, I've seen huge
          improvements in both my own well being, and the quality of whatever
          I'm working on.
        </p>
      </li>
    </ul>
    <h2>Onward!</h2>
    <p>
      I have some ideas for the general shape of what my next project will be,
      but I need a much more solid foundation in a lot of areas before jumping
      in. So next up on my list is a whole lot of reading! I'll be posting
      Jupyter notebooks occasionally as I read through material, and maybe a
      random experiment here or there, but I expect some crickets in this
      channel over the next few months.
    </p>
    <p>
      In the meantime, I highly recommend{' '}
      <Link href="https://youtu.be/spUNpyF58BY">
        this incredibly done visual introduction to the Fourier Transform
      </Link>
      .
    </p>
    <p>Talk to you soon!</p>
  </div>
)
