var _ = require("underscore");

function filterPartResource(object) {
  "use strict";
  return object.Part === "Resource";
}

function filterTypeSecurityGroup(object) {
  "use strict";
  return object.Type === "AWS::EC2::SecurityGroup";
}

function filterTypeSecurityGroupIngress(object) {
  "use strict";
  return object.Type === "AWS::EC2::SecurityGroupIngress";
}

function extractIngressRules(objects, securityGroupObject) {
  "use strict";
  return _.chain(objects)
    .filter(filterPartResource)
    .filter(filterTypeSecurityGroupIngress)
    .filter(function(ingressObject) {
      if (ingressObject.Properties.GroupId.Ref === undefined) {
        return false;
      }
      return ingressObject.Properties.GroupId.Ref === securityGroupObject.LogicalId;
    })
    .value();
}

exports.check = function(objects, options, cb) {
  "use strict";
  var findings = [];
  function checker(object) {
    var rules = extractIngressRules(objects, object);
    rules = rules.concat(object.Properties.SecurityGroupIngress);
    // TODO implement logic
    findings.push({
      logicalID: object.LogicalId,
      message: "reason"
    });
  }
  _.chain(objects)
    .filter(filterPartResource)
    .filter(filterTypeSecurityGroup)
    .each(checker)
    .value();
  cb(null, findings);
};