# Claims X-Ray

Claims X-Ray is a free tool created to test Identity Provider application configuration before deploying to production, it is also very helpful to simulate and test application migration scenarios. Set the parameters as for standard federated applications and it will take care of the protocol negotiations. Check the token details and evaluate if the Identity Provider sent the expected results.


## Usage

Claims X-Ray is live at [https://claimsxray.net/](https://claimsxray.net/)

Configure the reply URL on the identity provider application (aka. relying party trust) as follows:
- SAML/WS-Fed: https://claimsxray.net/api/sso
- OIDC/OAuth: https://claimsxray.net/token

Select one of the supported protocols (SAML 2.0, WS-Fed, Open ID Connect / OAuth 2.0) and fill the form with the information details from your identity provider.  


## Architecture

Front End: Angular based Single Page Application that performs all token parsing. 

SAML Proxy: C# based Azure Function that receives SAML/WS-Fed tokens from the identity providers, it deflates the response and sends the encoded response to the *Front End* as URL fragment (#).

Performance and analytics: Azure Application Insights is used to collect usage data for performance and statistics. 


## Inclusiveness Analyzer

Claim X-Ray joined [Inclusiveness Analyzer] efforts to push out exclusive terms and make inclusive terms a part of our everyday vocabulary! 

Help us confront unconscious and implicit biases we hold and configure [Inclusiveness Analyzer] Action on your repositories too!

[Inclusiveness Analyzer]: https://github.com/marketplace/actions/inclusiveness-analyzer
