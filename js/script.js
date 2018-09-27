screens = ["#consultar", "#extraer", "#ultimos", "#transferir", "#depositar", "#salir"]

$(document).ready(function() {
  $("#atm_scr").hide()
  $("#consultar_scr").hide()
  $("#extraer_scr").hide()
  $("#ultimos_scr").hide()
  $("#transferir_scr").hide()
  $("#depositar_scr").hide()
  $("#salir_scr").hide()
  $("#loading").hide()
  screens.forEach(function(e) {
    $(e + "_btn").click(function() {
      screens.forEach(function(o) {
        $(o + "_scr").hide()
      })
      $(e + "_scr").show()
    })
  })
})

$("#submit_btn").click(function() {
  cliente_id = $("#user_id").val()

  if (!$.isNumeric(cliente_id)) {
    alert("El número contiene caracteres no-numericos.")
    return
  }

  $.ajax({
    url: "https://www.mocky.io/v2/5b22511f2e00006500e31619",
    type: "GET",
    dataType:"jsonp",
    beforeSend: function() {
      $("<div/>", {class: "progress", id: "loading_bar"}).insertAfter($("#submit_btn"))
      $("#loading_bar").append($("<div/>", {class: "indeterminate"}))
      $("#submit_btn").addClass("disabled")
      $("#user_id").prop("disabled", true)
      $("#user_pwd").prop("disabled", true)
    },
    success: function(response) {
        cliente = response
        $("#login_scr").hide()
        $("#atm_scr").show()
        $("#loading_bar").remove()
    },
    error: function(){
      alert("La cuenta ingresada no existe.")
      location.reload()
    }
    })
})

//-------------------------------------------- CONSULTA --------------------------------------------------//
$("#confirmarconsulta_btn").click(function(){
  numero_cuenta= $("#cuentaconsultar_txt").val()

  //Obtener cuenta consulta
  $.ajax({
    url: "http://www.mocky.io/v2/5b2253032e00009100e3162b",
    type: "GET",
    dataType:"jsonp",
    beforeSend: function() {
      $("#consultar_estado").text("Cargando...")
    },
    success: function(response){
        console.log(response)
        cuenta = response
        if (cuenta["id_cliente"] != cliente_id) {
          $("#consultar_estado").text("Número de cuenta incorrecto.")
          return
        }
        //Obtener saldo cuenta
        $.ajax({
          url: "http://www.mocky.io/v2/5b2253412e00002a00e3162f",
          type: "GET",
          dataType:"jsonp",
          success: function(response){
              console.log(response)
              saldo_cuenta = response
              $("#consultar_saldo").text("$" + saldo_cuenta)
              $("#consultar_estado").text("Consulta realizada con exito.")
            },
          error: function(){
              $("#consultar_estado").text("Error al realizar la consulta.")
          }
          })
      },
    error: function() {
      $("#consultar_estado").text("Error al obtener la cuenta.")
      }
  })
})

// ------------------------------------------- EXTRACCION ------------------------------------------------//
$("#confirmarextraccion_btn").click(function() {
  creacion_movimiento = Math.floor(Date.now() / 1000)
  var importe = $("#cantidadextraer_txt").val()
  numero_cuenta = $("#cuentaextraer_txt").val()
  if (!$.isNumeric(importe) || !$.isNumeric(numero_cuenta)) {
    $("#extraer_estado").text("El número contiene caracteres no-numericos.")
    return
  }

  //Obtener cuenta a extraer
  $.ajax({
    url:"http://www.mocky.io/v2/5b2253032e00009100e3162b",
    type: "GET",
    dataType:"jsonp",
    beforeSend: function() {
      $("#extraer_estado").text("Cargando...")
    },
    success: function(response){
        console.log(response)
        cuenta = response
        if (cuenta["id_cliente"] != cliente_id) {
          $("#extraer_estado").text("Número de cuenta incorrecto.")
          return
        }

        //Chequear que la cuenta tenga saldo suficiente
        $.ajax({
          url:"http://www.mocky.io/v2/5b2253412e00002a00e3162f",
          type: "GET",
          dataType:"jsonp",
          success: function(response){
              console.log(response)
              saldo_cuenta = response
              if (importe > saldo_cuenta) {
                $("#extraer_estado").text("Saldo insuficiente.")
                return
              }
              movimiento = {"creado": creacion_movimiento,
              "procesado": Math.floor(Date.now() / 1000),
              "tipo": 0,
              "estado": 1,
              "importe": importe,
              "id_cuenta": numero_cuenta}

              //Realizar la extracción
              $.ajax({
                url: "http://www.mocky.io/v2/5b2253622e00007b00e31630",
                data: movimiento,
                type: "POST",
                dataType:"jsonp",
                success: function(response){
                    console.log(response)
                    $("#extraer_estado").text("Extracción realizada con éxito.")
                },
                error: function(){
                    $("#extraer_estado").text("Error al realizar la extracción")
                }
                })
          },
          error: function(){
            $("#extraer_estado").text("Error al obtener el saldo actual.")
          }
        })
    },
    error: function(){
      $("#extraer_estado").text("Error al obtener la cuenta.")
    }
    })
})


// ------------------------------------------- DEPOSITO ------------------------------------------------//
$("#confirmardeposito_btn").click(function() {
  var creacion_movimiento = Math.floor(Date.now() / 1000)
  var importe = $("#cantidaddepositar_txt").val()
  var numero_cuenta = $("#cuentadepositar_txt").val()

  if (!$.isNumeric(importe) || !$.isNumeric(numero_cuenta)) {
    $("#depositar_estado").text("El número contiene caracteres no-numericos.")
    return
  }

  //Obtener la cuenta a depositar
  $.ajax({
    url: "http://www.mocky.io/v2/5b2253032e00009100e3162b",
    type: "GET",
    dataType:"jsonp",
    beforeSend: function() {
      $("#depositar_estado").text("Cargando...")
    },
    success: function(response){
        console.log(response)
        cuenta = response
        movimiento = {"creado": creacion_movimiento,
        "procesado": Math.floor(Date.now() / 1000),
        "tipo": 1,
        "estado": 1,
        "importe": importe,
        "id_cuenta": numero_cuenta}
        
        //Realizar el deposito
        $.ajax({
          url: "http://www.mocky.io/v2/5b2253032e00009100e3162b",
          data: movimiento,
          type: "POST",
          dataType:"jsonp",
          success: function(response){
              console.log(response)
              $("#depositar_estado").text("Deposito realizado con éxito.")
          },
          error: function(){
            $("#depositar_estado").text("Error al realizar el deposito.")
          }
        })
    },
    error: function(){
      $("#depositar_estado").text("Error al obtener la cuenta.")
    }
  })
})

// ------------------------------------------- TRANSFERENCIA ------------------------------------------------//
$("#confirmartransferencia_btn").click(function() {
  creacion_movimiento = Math.floor(Date.now() / 1000)
  importe = $("#cantidadtransferir_txt").val()
  numero_cuenta_destino = $("#destinotransferir_txt").val()
  numero_cuenta_origen = $("#origentransferir_txt").val()

  if (!$.isNumeric(importe) || !$.isNumeric(numero_cuenta_origen) || !$.isNumeric(numero_cuenta_destino)) {
    $("#depositar_estado").text("El número contiene caracteres no-numericos.")
    return
  }

  //Obtener cuenta de origen
  $.ajax({
    url: "http://www.mocky.io/v2/5b2253032e00009100e3162b",
    type: "GET",
    dataType:"jsonp",
    beforeSend: function() {
      $("#transferir_estado").text("Cargando...")
    },
    success: function(response){
        console.log(response)
        cuenta_origen = response
        if (cuenta_origen["id_cliente"] != cliente_id) {
          $("#transferir_estado").text("Número de cuenta de origen incorrecto.")
          return
        }
        //Chequear que la cuenta de origen tenga suficiente saldo
        $.ajax({
          url: "http://www.mocky.io/v2/5b2253412e00002a00e3162f",
          type: "GET",
          dataType:"jsonp",
          success: function(response){
              console.log(response)
              saldo_cuenta = response
              if (importe > saldo_cuenta) {
                $("#transferir_estado").text("Saldo insuficiente.")
                return
              }
              //Obtener cuenta destino
              $.ajax({
                url: "http://www.mocky.io/v2/5b2253032e00009100e3162b",
                type: "GET",
                dataType:"jsonp",
                success: function(response){
                    console.log(response)
                    cuenta_destino = response
                    movimiento = {"creado": creacion_movimiento,
                    "procesado": Math.floor(Date.now() / 1000),
                    "tipo": 0,
                    "estado": 1,
                    "importe": importe,
                    "id_cuenta": numero_cuenta_origen}

                    //Realizar movimiento en cuenta de origen
                    $.ajax({
                      url: "http://www.mocky.io/v2/5b2253032e00009100e3162b",
                      data: movimiento,
                      type: "POST",
                      dataType:"jsonp",
                      success: function(response){
                          console.log(response)
                          movimiento = {"creado": creacion_movimiento,
                          "procesado": Math.floor(Date.now() / 1000),
                          "tipo": 1,
                          "estado": 1,
                          "importe": importe,
                          "id_cuenta": numero_cuenta_destino}
    
    
                          //Realizar movimiento en cuenta destino
                          $.ajax({
                            url: "http://www.mocky.io/v2/5b2253032e00009100e3162b",
                            data: movimiento,
                            type: "POST",
                            dataType:"jsonp",
                            success: function(response){
                                console.log(response)
                                $("#transferir_estado").text("Transferencia realizada con éxito.")
                            },
                            error: function(){
                              $("#transferir_estado").text("Error al realizar la transferencia.")
                            }
                            })
                      },
                      error: function(){
                        $("#transferir_estado").text("Error al realizar la transferencia.")
                      }
                    })
                    },
                    error: function(){
                      $("#transferir_estado").text("Error al obtener cuenta destino.")
                    }
                })
            }
          })
    },
    error: function(){
      $("#transferir_estado").text("Error al obtener cuenta origen.")
    }
    })
})

// ------------------------------------------- RESUMEN ------------------------------------------------//
$("#confirmarultimos_btn").click(function() {
  numero_cuenta = $("#cuentaultimos_txt").val()

  if (!$.isNumeric(numero_cuenta)) {
    $("#ultimos_estado").text("El número contiene caracteres no-numericos.")
    return
  }

  //Obtener la cuenta a consultar
  $.ajax({
    url: "http://www.mocky.io/v2/5b2253032e00009100e3162b",
    type: "GET",
    dataType:"jsonp",
    beforeSend: function() {
      $("#ultimos_estado").text("Cargando...")
    },
    success: function(response){
        console.log(response)
        cuenta = response
        if (cuenta["id_cliente"] != cliente_id) {
          $("#ultimos_estado").text("Número de cuenta incorrecto.")
          return
        }
        //Realizar la consulta
        $.ajax({
          url: "http://www.mocky.io/v2/5b2276372e00007e00e316cf",
          type: "GET",
          dataType:"jsonp",
          success: function(response){
              console.log(response)
              movimientos = response
              for (i = 0; i < Math.min(response.length, 4); i++) {
                $("#t" + (i + 1) + "1").html(response[i]["creado"])
                $("#t" + (i + 1) + "2").html(response[i]["importe"])
              }
              $("#ultimos_estado").text("Consulta realizada con exito.")
          },
          error: function() {
            $("#ultimos_estado").text("Error al realizar la consulta.")
          }
        })
      },
      error: function() {
        $("#ultimos_estado").text("Error al obtener la cuenta.")
      }
    })
})

//------------------------------------------ SALIR ---------------------------------------------------////
$("#confirmarsalir_btn").click(function(){
  location.reload()
})
function newFunction() {
  extraer();
}

function extraer() {
  cliente_id = 1;
}