let Fix = (req, res) => {
  knex
    .select(["quick_specs", "id"])
    .from("product")
    .orderBy("id")
    .then(rows => {
      rows.forEach(row => {
        q = false;

        var qs = row.quick_specs;

        console.log(qs);

        try {
          q = JSON.parse(qs);
        } catch (err) {
          q = qs;
        }

        if (Array.isArray(q)) {
          console.log(row.id + " is already json");
        } else {
          var co = "[" + qs.slice(1, -1) + "]";

          var qsn = JSON.parse(co).map(JSON.parse);

          var qsns = JSON.stringify(qsn);

          knex
            .update({ quick_specs: qsns })
            .from("product")
            .where({
              id: row.id
            })
            .then(id => {
              console.log(row.id + " was updated");
            })
            .catch(err => {
              console.error(row.id + "wasn't updated", err);
            });
        }
      });
    })
    .catch(err => {
      console.log(err);
    });

  res.end("nice");
};
