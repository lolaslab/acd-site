---
tags: updates
layout: layouts/update.njk
heading: "RFC: Defining Support Status in ACD"
title: "RFC: Defining Support Status in ACD"
description: "Reviewing how support is computed in popular test suites, and proposing a support status framework for ACD"
permalink: /updates/rfc-support-status/
social_img: /images/rfc-support-status.png
social_img_alt: "RFC: Defining Support Status in ACD. 
Four status labels: Supported, Partial, Unsupported and Not tested."
date: 2026-10-05
---
# RFC: Defining Support Status in ACD

Accessibility support is tricky for many reasons, but one of the main ones is that "support" is often interpreted
as "accessible". Developers can read a green "supported" status and take that to mean that whatever they're building is
accessible, but this isn't always the case. ACD isn't trying to tell developers that their websites are or aren't
accessible. Instead, we want to highlight where the potential gaps are.

## Accessibility-Supported

We're using the WCAG 2.1 definition of accessibility-supported:

> The way that the Web content technology is used must be supported by users' assistive technology (AT).
> This means that the way that the technology is used has been tested for interoperability with users'
> assistive technology in the human language(s) of the content
> [...]
> The technology is supported natively in widely-distributed user agents that are also accessibility
> supported (such as HTML and CSS);

Source: [WCAG 2.1](https://www.w3.org/TR/WCAG21/#dfn-accessibility-supported)

There are two parts to this definition (as it relates to browsers and ATs) and we've interpreted each part as follows:
1. ATs: the feature must be supported by users' assistive technology and tested for interoperability with it,
in the language(s) of the content.
2. Browsers: the feature must be supported natively in widely available browsers.

So if we use `<button>` as an example, none of the following would be accessibility-supported:

1. A button with a *native* role of anything other than "button"
2. A button that can't be pressed
3. A button with clipped text so that readers of the page couldn't read the full text
4. An assistive technology not reading the correct role for the button
5. An assistive technology not interpreting the "disabled" attribute for a disabled button

## Web Platform Features And web-features

The scope of the first part of ACD is to test HTML web-features and web platform features. web-features is the shared catalogue 
of  web platform features as defined by Baseline. The definitions are usually according to one or more specifications 
and it means that "button" means the same thing in BCD, Baseline and WPT. ARIA-AT doesn't use the web-feature catalogue
yet so in that context, we're writing tests for the HTML web platform features.

HTML is the best place to start since many of the web platform features are very well established but because they're
assumed to *just work*, test coverage for them isn't as robust as other parts of the platform. And as many accessibility
experts know, sometimes they have their quirks.

## Test Suites

The best test suites to understand how web platform features work in browsers and assistive technologies are WPT and ARIA-AT
respectively. They have hundreds, and in some cases thousands, of tests that measure how well (or not) a web platform 
feature is implemented according to the feature's specification.

### Why Not BCD?

If you visit MDN or CanIUse, you may be familiar with the browser compatibility table. This table pulls in data from
Browser Compatibility Data (BCD). This data is what Baseline also uses to compute when features are widely available.
The BCD collector looks at the WebIDL for a web-feature, creates the web-feature in the browser and compares the 
created feature with the specified WebIDL to make sure they match. This works for BCD's use case: you can assume that 
if the WebIDL and the DOM element match, the web-feature is likely supported in that browser. There's more testing to 
confirm this, but that's the gist.

For accessibility, this doesn't work because it tells us very little about the behaviour of the web-feature. If we go
back to our button example, BCD wouldn't be able to tell us if the button had the correct native role because the [WebIDL
doesn't define the role](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element) of HTML features,
and it wouldn't be able to tell us if one or more browsers were accidentally clipping button text.

However, WPT would be able to (and does) give us this information. WPT has its own issues, which I'll go into in
another post.

## A Proposed Support Framework

One of the issues with WPT, more than ARIA-AT, is that there are a lot of tests and sub-tests,
authored by different people, for different purposes. For the `<button>` element there are 295 combined
tests and sub-tests. ARIA-AT has fewer tests, but if we add both test suites' results we get over 300 test results
that have to be simplified into a <span class="status status-yes">Supported</span>, <span class="status status-partial">Partial</span>
or <span class="status status-no">Unsupported</span> status.

This is how I'm proposing we do it:

1. All tests in WPT for a given web-feature are included except:
   - tentative tests, infrastructure failures, timeouts, etc.
   - tests without user impact and disputed tests
2. All ARIA-AT tests for a given web platform feature are included except:
   - SHOULD behaviours
   - disputed tests

This proposal isn't confirmed, and what we really need is input from you — test writers, developers, accessibility
experts — to help us refine this. We have some outstanding questions:
1. How do we tell when a web platform feature's tests are complete?
2. Should we include all tests by default?
3. Should we exclude unspecified behaviour? We currently include it if it's what users expect. For example,
   Firefox doesn't clear `:active` on Tab in the `active-onblur` WPTs. That behaviour isn't in the spec, but
   other browsers implement it and users expect it.
4. Should we exclude tests that fail in every browser or AT? For example, a number
   of css-display `run-in` tests fail everywhere.
5. What should a browser with no ARIA-AT coverage show? Is "Not tested" the best way to communicate that
   to developers?

I'm running a [breakout session](https://github.com/w3c/tpac2026-breakouts/issues/3) at this year's TPAC, W3C's annual
conference, to discuss this. It's open to everyone, not just TPAC attendees, and you can join remotely. If you have
thoughts, opinions or questions, join us! Date and time to be confirmed.

If you're unable to attend the breakout, you can leave your thoughts and comments on our 
[GitHub discussion for this post](https://github.com/lolaslab/acd-site/discussions/1).
