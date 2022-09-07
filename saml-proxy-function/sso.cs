
using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
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
            var samlResponse = req.Form["samlResponse"];
            if (samlResponse.Count > 0)
                return new RedirectResult($"{req.Scheme}://{req.Host}/token?samlResponse={HttpUtility.UrlEncode(samlResponse[0])}");

            var wsfedResponse = req.Form["wresult"];
            if (wsfedResponse.Count > 0)
                return new RedirectResult($"{req.Scheme}://{req.Host}/token?wresult={HttpUtility.UrlEncode(wsfedResponse[0])}");

            return new RedirectResult($"{req.Scheme}://{req.Host}?error={":P"}");
        }
    }
}
