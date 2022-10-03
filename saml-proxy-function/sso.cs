using System.IO;
using System.IO.Compression;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.AspNetCore.WebUtilities;
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
                SAML_REDIRECT_URL = System.Environment.GetEnvironmentVariable("WEBSITE_HOSTNAME");
                log.LogError($"The app setting SAML_REDIRECT_URL was not configured, using '{SAML_REDIRECT_URL}'.");
                //return new StatusCodeResult(500);
            }

            var samlResponse = req.Form["samlResponse"];
            if (samlResponse.Count > 0){
                return new RedirectResult($"{SAML_REDIRECT_URL}#samlResponse={deflate(samlResponse[0])}");
            }

            var wsfedResponse = req.Form["wresult"];
            if (wsfedResponse.Count > 0)
                return new RedirectResult($"{SAML_REDIRECT_URL}#wresult={deflate(wsfedResponse[0])}");

            log.LogWarning("The request does not have the required attributes.");
            return new BadRequestResult();
        }

        private static string deflate(string data)
        {
            var bytes = Encoding.UTF8.GetBytes(data);

            string deflate;
            using (var output = new MemoryStream())
            {
                using (var zip = new DeflateStream(output, CompressionMode.Compress))
                    zip.Write(bytes, 0, bytes.Length);

                deflate = Base64UrlTextEncoder.Encode(output.ToArray());
            }
            
            return deflate;
        }
    }
}
