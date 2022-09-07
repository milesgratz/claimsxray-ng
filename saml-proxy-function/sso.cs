
using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace saml_proxy_function
{
    public static class sso
    {
        [FunctionName("sso")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            string SAML_REDIRECT_URL = System.Environment.GetEnvironmentVariable("SAML_REDIRECT_URL");
            if (string.IsNullOrEmpty(SAML_REDIRECT_URL))
            {
                log.LogError("The app setting SAML_REDIRECT_URL was not configured.");
                return new StatusCodeResult(500);
            }

            var samlResponse = req.Form["samlResponse"];
            if (samlResponse.Count > 0)
                return new RedirectResult($"{SAML_REDIRECT_URL}?samlResponse={HttpUtility.UrlEncode(samlResponse[0])}");

            var wsfedResponse = req.Form["wresult"];
            if (wsfedResponse.Count > 0)
                return new RedirectResult($"{SAML_REDIRECT_URL}?wresult={HttpUtility.UrlEncode(wsfedResponse[0])}");

            log.LogWarning("The request does not have the required attributes.");
            return new BadRequestResult();
            //return new RedirectResult($"{SAML_REDIRECT_URL}?error={":P"}");
        }
    }
}
